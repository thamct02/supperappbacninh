import React, { useEffect, useRef, useState, useCallback } from 'react';
import contentData from '../data/contentData.json';
import {
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  ArrowLeft,
  Award,
  Zap,
  Info
} from 'lucide-react';

/* ==========================================================================
   GAME CONFIGURATION CONSTANTS (Easily tunable at top of file)
   ========================================================================== */
const WIN_SCORE = 20;
const GRAVITY = 0.22;
const JUMP_FORCE = -5.0;
const PIPE_SPEED = 1.8;
const PIPE_GAP = 165; // Wide & accessible gap for bank customers
const PIPE_SPAWN_INTERVAL = 145; // Frames between pipe pairs
const VOUCHER_TEXT = "Voucher 2 lít xăng";
const BRAND_NAME = "VietinBank";
const GAME_TITLE = "Chờ vui – Chơi hay – Nhận quà liền tay";

// Global Window Callback Types Declaration
declare global {
  interface Window {
    onFlappyVoucherWin?: (data: {
      score: number;
      voucherCode: string;
      reward: string;
      timestamp: string;
    }) => void;
    onFlappyVoucherLose?: (data: {
      score: number;
      timestamp: string;
    }) => void;
  }
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

interface GameSectionProps {
  onBackToMenu: () => void;
}

export const GameSection: React.FC<GameSectionProps> = ({ onBackToMenu }) => {
  const { gameSection } = contentData;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game UI States
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [lastVoucher, setLastVoucher] = useState<string | null>(null);
  const [currentVoucher, setCurrentVoucher] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  // Audio Context (Web Audio API synthetic sounds, default muted)
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Internal Game Engine State Refs
  const engineRef = useRef({
    birdY: 200,
    birdVelocity: 0,
    birdRotation: 0,
    pipes: [] as Pipe[],
    frameCount: 0,
    currentScore: 0,
    isWon: false,
    isLost: false,
    confetti: [] as Particle[],
    animationFrameId: 0
  });

  // Sound Synthesizer
  const playSound = (type: 'jump' | 'score' | 'hit' | 'win') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'jump') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === 'score') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, now + idx * 0.1);
          g.gain.setValueAtTime(0.25, now + idx * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.2);
          o.start(now + idx * 0.1);
          o.stop(now + idx * 0.1 + 0.22);
        });
      }
    } catch {
      // Audio playback safely ignored if disabled or not allowed
    }
  };

  // Load High Score and Last Voucher from localStorage on mount
  useEffect(() => {
    try {
      const savedHigh = localStorage.getItem('vietinbank_game_highscore');
      if (savedHigh) setHighScore(parseInt(savedHigh, 10));

      const savedVoucher = localStorage.getItem('vietinbank_game_last_voucher');
      if (savedVoucher) setLastVoucher(savedVoucher);
    } catch {
      // LocalStorage fallback
    }
  }, []);

  // Generate unique 6-digit voucher code: VB-XXXXXX
  const generateVoucherCode = (): string => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `VB-${randomDigits}`;
  };

  // Copy Voucher Code to Clipboard
  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate Confetti particles for victory
  const spawnConfetti = (width: number, height: number) => {
    const colors = ['#00529C', '#ED1C24', '#FBBF24', '#10B981', '#3B82F6', '#EC4899'];
    const particles: Particle[] = [];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: width / 2,
        y: height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.8) * 8,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1
      });
    }
    engineRef.current.confetti = particles;
  };

  // Win Game logic
  const winGame = useCallback(() => {
    const engine = engineRef.current;
    if (engine.isWon) return; // Anti-cheat: generate only 1 voucher per win
    engine.isWon = true;

    const voucher = generateVoucherCode();
    setCurrentVoucher(voucher);
    setLastVoucher(voucher);
    setGameState('won');
    playSound('win');

    try {
      localStorage.setItem('vietinbank_game_last_voucher', voucher);
      localStorage.setItem('vietinbank_game_highscore', '20');
      setHighScore(20);
    } catch {
      // Storage save handled
    }

    // Call window callback if defined
    if (typeof window.onFlappyVoucherWin === 'function') {
      window.onFlappyVoucherWin({
        score: WIN_SCORE,
        voucherCode: voucher,
        reward: VOUCHER_TEXT,
        timestamp: new Date().toISOString()
      });
    }

    const canvas = canvasRef.current;
    if (canvas) spawnConfetti(canvas.width, canvas.height);
  }, [soundEnabled]);

  // End Game (Lost) logic
  const endGame = useCallback(() => {
    const engine = engineRef.current;
    if (engine.isLost || engine.isWon) return;
    engine.isLost = true;

    playSound('hit');
    setShake(true);
    setTimeout(() => setShake(false), 400);

    const finalScore = engine.currentScore;
    setGameState('lost');

    try {
      const savedHigh = parseInt(localStorage.getItem('vietinbank_game_highscore') || '0', 10);
      if (finalScore > savedHigh) {
        localStorage.setItem('vietinbank_game_highscore', finalScore.toString());
        setHighScore(finalScore);
      }
    } catch {
      // Storage handled
    }

    // Call window callback if defined
    if (typeof window.onFlappyVoucherLose === 'function') {
      window.onFlappyVoucherLose({
        score: finalScore,
        timestamp: new Date().toISOString()
      });
    }
  }, [soundEnabled]);

  // Reset Game variables
  const resetGame = () => {
    const canvas = canvasRef.current;
    const startY = canvas ? canvas.height / 2 : 200;

    engineRef.current = {
      birdY: startY,
      birdVelocity: 0,
      birdRotation: 0,
      pipes: [],
      frameCount: 0,
      currentScore: 0,
      isWon: false,
      isLost: false,
      confetti: [],
      animationFrameId: 0
    };
    setScore(0);
    setCopied(false);
  };

  // Start Game
  const startGame = () => {
    resetGame();
    setGameState('playing');
  };

  // Bird Jump Action
  const jump = useCallback(() => {
    if (gameState !== 'playing') {
      if (gameState === 'start') {
        startGame();
      }
      return;
    }
    const engine = engineRef.current;
    if (engine.isWon || engine.isLost) return;
    engine.birdVelocity = JUMP_FORCE;
    playSound('jump');
  }, [gameState]);

  // Keyboard Listeners (Space bar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      const engine = engineRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Clean Sky & Bank Ambient Background
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
      skyGradient.addColorStop(0, '#E0F2FE'); // Soft sky blue
      skyGradient.addColorStop(0.7, '#F0F9FF');
      skyGradient.addColorStop(1, '#E2E8F0');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height);

      // Clouds in background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(80, 70, 30, 0, Math.PI * 2);
      ctx.arc(110, 60, 40, 0, Math.PI * 2);
      ctx.arc(150, 70, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(280, 110, 25, 0, Math.PI * 2);
      ctx.arc(310, 100, 35, 0, Math.PI * 2);
      ctx.arc(340, 110, 30, 0, Math.PI * 2);
      ctx.fill();

      // Ground strip (VietinBank subtle navy track)
      const groundHeight = 40;
      ctx.fillStyle = '#003366';
      ctx.fillRect(0, height - groundHeight, width, groundHeight);
      ctx.fillStyle = '#ED1C24';
      ctx.fillRect(0, height - groundHeight, width, 4); // Red accent line

      // 2. Physics & Pipes Update when playing
      if (gameState === 'playing' && !engine.isWon && !engine.isLost) {
        engine.frameCount++;

        // Bird Gravity
        engine.birdVelocity += GRAVITY;
        engine.birdY += engine.birdVelocity;
        engine.birdRotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, engine.birdVelocity * 0.08));

        // Spawn Pipes
        if (engine.frameCount % PIPE_SPAWN_INTERVAL === 0) {
          const minPipe = 60;
          const maxPipe = height - groundHeight - PIPE_GAP - minPipe;
          const topHeight = Math.floor(minPipe + Math.random() * (maxPipe - minPipe));
          engine.pipes.push({
            x: width,
            topHeight,
            bottomY: topHeight + PIPE_GAP,
            passed: false
          });
        }

        // Update Pipes
        const pipeWidth = 54;
        for (let i = engine.pipes.length - 1; i >= 0; i--) {
          const p = engine.pipes[i];
          p.x -= PIPE_SPEED;

          // Check if bird passed pipe
          const birdX = 75;
          const birdRadius = 16;

          if (!p.passed && p.x + pipeWidth < birdX) {
            p.passed = true;
            engine.currentScore++;
            setScore(engine.currentScore);
            playSound('score');

            // Win condition reached!
            if (engine.currentScore >= WIN_SCORE) {
              winGame();
            }
          }

          // Collision Check
          if (
            birdX + birdRadius > p.x &&
            birdX - birdRadius < p.x + pipeWidth
          ) {
            if (
              engine.birdY - birdRadius < p.topHeight ||
              engine.birdY + birdRadius > p.bottomY
            ) {
              endGame();
            }
          }

          // Remove offscreen pipes
          if (p.x + pipeWidth < -10) {
            engine.pipes.splice(i, 1);
          }
        }

        // Ground / Ceiling Collision
        const birdRadius = 16;
        if (engine.birdY + birdRadius >= height - groundHeight) {
          engine.birdY = height - groundHeight - birdRadius;
          endGame();
        }
        if (engine.birdY - birdRadius <= 0) {
          engine.birdY = birdRadius;
          engine.birdVelocity = 0;
        }
      }

      // 3. Draw Pipes (VietinBank modern branded pillars)
      const pipeWidth = 54;
      engine.pipes.forEach((p) => {
        // Top Pipe
        const topGrad = ctx.createLinearGradient(p.x, 0, p.x + pipeWidth, 0);
        topGrad.addColorStop(0, '#00529C');
        topGrad.addColorStop(0.5, '#0284C7');
        topGrad.addColorStop(1, '#003B73');

        ctx.fillStyle = topGrad;
        ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);

        // Top Pipe Cap
        ctx.fillStyle = '#002855';
        ctx.fillRect(p.x - 3, p.topHeight - 16, pipeWidth + 6, 16);
        ctx.fillStyle = '#ED1C24';
        ctx.fillRect(p.x - 3, p.topHeight - 2, pipeWidth + 6, 2);

        // Bottom Pipe
        ctx.fillStyle = topGrad;
        ctx.fillRect(p.x, p.bottomY, pipeWidth, height - groundHeight - p.bottomY);

        // Bottom Pipe Cap
        ctx.fillStyle = '#002855';
        ctx.fillRect(p.x - 3, p.bottomY, pipeWidth + 6, 16);
        ctx.fillStyle = '#ED1C24';
        ctx.fillRect(p.x - 3, p.bottomY, pipeWidth + 6, 2);
      });

      // 4. Draw Mascot Character (VietinBank Flying Smart Card / Mascot)
      const birdX = 75;
      const birdY = engine.birdY;

      ctx.save();
      ctx.translate(birdX, birdY);
      ctx.rotate(engine.birdRotation);

      // Card / Bird Body (VietinBank Blue Rounded Card with golden chip)
      const w = 38;
      const h = 26;
      ctx.fillStyle = '#00529C';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;

      // Rounded rectangle
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.fill();
      ctx.stroke();

      // Metallic EMV Chip on Card
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-w / 2 + 5, -4, 8, 8);

      // VietinBank Red Logo Mark on right side of card
      ctx.fillStyle = '#ED1C24';
      ctx.beginPath();
      ctx.arc(w / 2 - 8, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      // Wing (cute flapping animation)
      const wingFlap = Math.sin(engine.frameCount * 0.3) * 6;
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.ellipse(-2, wingFlap, 9, 6, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Mascot Eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(8, -5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(9, -5, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 5. Render Confetti on Victory
      if (engine.confetti.length > 0) {
        for (let i = engine.confetti.length - 1; i >= 0; i--) {
          const pt = engine.confetti[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vy += 0.15; // Gravity
          pt.alpha -= 0.008;

          ctx.fillStyle = pt.color;
          ctx.globalAlpha = Math.max(0, pt.alpha);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();

          if (pt.alpha <= 0) {
            engine.confetti.splice(i, 1);
          }
        }
        ctx.globalAlpha = 1.0;
      }

      engine.animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      cancelAnimationFrame(engineRef.current.animationFrameId);
    };
  }, [gameState, endGame, winGame]);

  // Dynamic encouragement text based on score
  const getEncouragement = (s: number): string => {
    if (s < 5) return gameSection.scoreMotivations.under5;
    if (s < 10) return gameSection.scoreMotivations.under10;
    if (s < 15) return gameSection.scoreMotivations.under15;
    if (s < 20) return gameSection.scoreMotivations.under20;
    return gameSection.scoreMotivations.reached20;
  };

  return (
    <div
      id="flappy-voucher-game"
      className="max-w-2xl mx-auto space-y-5 animate-fadeIn select-none"
    >
      {/* Top Bar for Game */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về menu chính</span>
        </button>

        <div className="text-center">
          <span className="text-[11px] font-bold text-[#00529C] uppercase tracking-wider block">
            {BRAND_NAME} Kiosk Game
          </span>
          <span className="text-sm font-extrabold text-slate-900">{GAME_TITLE}</span>
        </div>

        <button
          onClick={() => setSoundEnabled((prev) => !prev)}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            soundEnabled
              ? 'bg-blue-50 text-[#00529C] border-blue-200'
              : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-700'
          }`}
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Game Screen Card */}
      <div
        className={`relative bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-lg transition-transform ${
          shake ? 'translate-x-1 duration-75' : ''
        }`}
        style={{ touchAction: 'manipulation' }}
        onClick={jump}
      >
        {/* HUD In-Game Overlay */}
        {gameState === 'playing' && (
          <div className="absolute top-4 inset-x-4 z-20 flex flex-col items-center gap-2 pointer-events-none">
            <div className="flex items-center justify-between w-full">
              {/* Current Score */}
              <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 shadow-xs flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Điểm:</span>
                <span className="text-lg font-black text-[#00529C] font-mono tabular-nums">
                  {score}/{WIN_SCORE}
                </span>
              </div>

              {/* High Score */}
              <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Kỷ lục: {highScore}</span>
              </div>
            </div>

            {/* Progress Bar 0 to 20 */}
            <div className="w-full bg-slate-200/80 backdrop-blur-xs h-2.5 rounded-full overflow-hidden border border-white/60">
              <div
                className="bg-linear-to-r from-[#00529C] to-emerald-500 h-full transition-all duration-200 rounded-full"
                style={{ width: `${Math.min(100, (score / WIN_SCORE) * 100)}%` }}
              />
            </div>

            {/* Dynamic Encouragement Bubble */}
            <div className="px-3.5 py-1 rounded-full bg-[#00529C]/90 text-white text-xs font-bold shadow-xs animate-pulse">
              {getEncouragement(score)}
            </div>
          </div>
        )}

        {/* HTML5 Canvas Element */}
        <canvas
          ref={canvasRef}
          width={420}
          height={480}
          className="w-full h-[440px] sm:h-[480px] block cursor-pointer"
        />

        {/* 1. START SCREEN OVERLAY */}
        {gameState === 'start' && (
          <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-xs p-6 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#00529C] flex items-center justify-center shadow-xs">
              <Award className="w-9 h-9 text-[#00529C]" />
            </div>

            <div className="space-y-2 max-w-sm">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {gameSection.title}
              </h2>
              <p className="text-sm font-semibold text-[#00529C]">
                {gameSection.subtitle}
              </p>
              <p className="text-xs text-slate-500 pt-1">
                Giải trí tại quầy giao dịch VietinBank – Nhận mã ưu đãi gửi nhân viên tại quầy.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-8 py-3.5 rounded-2xl bg-[#00529C] hover:bg-[#004080] text-white font-black text-base shadow-md hover:shadow-lg transition-all transform hover:scale-102 cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-5 h-5 text-amber-300" />
              <span>Bắt đầu chơi ngay</span>
            </button>

            <div className="text-xs text-slate-400 font-medium">
              💡 {gameSection.instruction}
            </div>

            {lastVoucher && (
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
                <span>Mã gần nhất bạn đã nhận: </span>
                <strong className="text-[#00529C] font-mono">{lastVoucher}</strong>
              </div>
            )}
          </div>
        )}

        {/* 2. LOSE SCREEN OVERLAY */}
        {gameState === 'lost' && (
          <div className="absolute inset-0 z-30 bg-slate-900/80 backdrop-blur-xs p-6 flex flex-col items-center justify-center text-center text-white space-y-5 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-red-600/90 text-white flex items-center justify-center shadow-lg">
              <RotateCcw className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-white">
                {gameSection.loseTitle}
              </h3>
              <p className="text-base text-red-200 font-bold">
                {gameSection.loseTemplate.replace('{score}', score.toString())}
              </p>
              <p className="text-xs text-slate-300 max-w-xs">
                {gameSection.loseEncouragement}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startGame();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi lại</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBackToMenu();
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Về màn hình chính
              </button>
            </div>
          </div>
        )}

        {/* 3. VICTORY SCREEN OVERLAY */}
        {gameState === 'won' && (
          <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg animate-bounce">
              <Trophy className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-slate-900">
                {gameSection.winTitle}
              </h3>
              <p className="text-sm font-bold text-emerald-600 max-w-xs">
                {gameSection.winDescription}
              </p>
            </div>

            {/* Voucher Box */}
            <div className="w-full max-w-xs bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-[#00529C] p-4 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Mã Voucher Của Bạn
              </span>
              <div className="text-2xl font-black text-[#00529C] tracking-widest font-mono">
                {currentVoucher}
              </div>
              <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {VOUCHER_TEXT}
              </span>
            </div>

            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              {gameSection.winNote}
            </p>

            <div className="flex items-center gap-3 w-full max-w-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyVoucherCode(currentVoucher);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#00529C] hover:bg-[#004080] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép mã</span>
                  </>
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startGame();
                }}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Chơi lại
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rules & Notes card */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-[#00529C] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">
            Lưu ý nhận quà tại quầy:
          </p>
          <p>
            Mã voucher chỉ có giá trị đổi quà trong ngày tại quầy giao dịch VietinBank. Vui lòng giữ màn hình hoặc ghi lại mã cho giao dịch viên.
          </p>
        </div>
      </div>
    </div>
  );
};
