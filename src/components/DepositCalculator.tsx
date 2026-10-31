import React, { useState, useMemo } from 'react';
import contentData from '../data/contentData.json';
import { formatCurrencyVND, formatNumberWithDots, parseNumberFromDots, formatDateVN } from '../utils/format';
import { Calculator, Sparkles, AlertCircle, ExternalLink, Video, CheckCircle, TrendingUp } from 'lucide-react';

export const DepositCalculator: React.FC = () => {
  const { depositSection } = contentData;

  // Form States
  const [depositAmountRaw, setDepositAmountRaw] = useState<string>('50000000'); // Default 50 million VND
  const [selectedTermMonths, setSelectedTermMonths] = useState<number>(12); // Default 12 months
  const [interestRate, setInterestRate] = useState<number>(5.0); // 5.0%/year
  const [isManualRate, setIsManualRate] = useState<boolean>(false);

  // When term changes, auto-fill standard VietinBank interest rate if user hasn't set manual
  const handleTermChange = (months: number) => {
    setSelectedTermMonths(months);
    if (!isManualRate) {
      const termObj = depositSection.defaultTerms.find((t) => t.months === months);
      if (termObj) {
        setInterestRate(termObj.defaultRate);
      }
    }
  };

  // Validation
  const amountNumber = parseNumberFromDots(depositAmountRaw);
  const isAmountValid = amountNumber > 0;
  const isTermValid = selectedTermMonths > 0;
  const isRateValid = interestRate >= 0 && interestRate <= 25;

  // Calculation Logic for Standard End-of-Term Interest (Trả lãi sau):
  // Formula: Lãi = (Số tiền gửi * Lãi suất % * Số tháng) / 12
  const { estimatedInterest, totalPayout, maturityDate } = useMemo(() => {
    if (!isAmountValid || !isTermValid || !isRateValid) {
      return { estimatedInterest: 0, totalPayout: 0, maturityDate: new Date() };
    }

    const interest = Math.round((amountNumber * (interestRate / 100) * selectedTermMonths) / 12);
    const total = amountNumber + interest;

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + selectedTermMonths);

    return {
      estimatedInterest: interest,
      totalPayout: total,
      maturityDate: targetDate
    };
  }, [amountNumber, selectedTermMonths, interestRate, isAmountValid, isTermValid, isRateValid]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
          <TrendingUp className="w-3.5 h-3.5" />
          Tiết Kiệm Sinh Lời An Toàn
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {depositSection.title}
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          {depositSection.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Input Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calculator className="w-5 h-5 text-[#00529C]" />
            <span>Thông tin khoản tiền gửi</span>
          </h2>

          {/* 1. Deposit Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Tổng tiền gửi (VND) <span className="text-red-500">*</span>
              </label>
              {!isAmountValid && (
                <span className="text-xs text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {depositSection.validationErrors.amount}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={formatNumberWithDots(depositAmountRaw)}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^\d]/g, '');
                  setDepositAmountRaw(cleaned);
                }}
                placeholder="Nhập số tiền gửi..."
                className={`w-full px-4 py-3 text-base sm:text-lg font-bold rounded-xl border bg-slate-50 focus:bg-white focus:outline-hidden transition-all ${
                  !isAmountValid
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                    : 'border-slate-200 focus:border-[#00529C] focus:ring-2 focus:ring-blue-100'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                VND
              </span>
            </div>

            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {depositSection.quickAmounts.map((q) => (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => setDepositAmountRaw(q.value.toString())}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-[#00529C] text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Term Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Kỳ hạn gửi <span className="text-red-500">*</span>
              </label>
              {!isTermValid && (
                <span className="text-xs text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {depositSection.validationErrors.term}
                </span>
              )}
            </div>

            <select
              value={selectedTermMonths}
              onChange={(e) => handleTermChange(Number(e.target.value))}
              className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00529C] focus:ring-2 focus:ring-blue-100 focus:outline-hidden transition-all cursor-pointer"
            >
              {depositSection.defaultTerms.map((t) => (
                <option key={t.months} value={t.months}>
                  {t.label} — Lãi suất tham khảo: {t.defaultRate.toFixed(1)}%/năm
                </option>
              ))}
            </select>
          </div>

          {/* 3. Interest Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Lãi suất (% / năm) <span className="text-red-500">*</span>
              </label>
              {!isRateValid && (
                <span className="text-xs text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {depositSection.validationErrors.rate}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="0"
                max="25"
                value={interestRate}
                onChange={(e) => {
                  setInterestRate(parseFloat(e.target.value) || 0);
                  setIsManualRate(true);
                }}
                className={`w-full px-4 py-3 text-sm sm:text-base font-bold rounded-xl border bg-slate-50 focus:bg-white focus:outline-hidden transition-all ${
                  !isRateValid
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-slate-200 focus:border-[#00529C]'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                %/năm
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              * Lãi suất tiền gửi có thể thay đổi theo từng thời kỳ quy định của VietinBank.
            </p>
          </div>
        </div>

        {/* Right Side: Calculation Results & TikTok Video Guide */}
        <div className="lg:col-span-5 space-y-6">
          {/* Result Card */}
          <div className="bg-linear-to-b from-[#00529C] to-[#003B73] rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-200 border-b border-white/10 pb-3">
              Kết quả tính lãi dự tính
            </h3>

            {/* Principal */}
            <div className="space-y-1">
              <span className="text-xs text-blue-200 block">Tiền gửi ban đầu (Gốc)</span>
              <div className="text-xl sm:text-2xl font-bold font-mono">
                {formatCurrencyVND(amountNumber)}
              </div>
            </div>

            {/* Interest */}
            <div className="space-y-1 bg-white/10 p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-emerald-300 font-semibold block">
                Tiền lãi dự tính nhận được
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                +{formatCurrencyVND(estimatedInterest)}
              </div>
            </div>

            {/* Total Payout */}
            <div className="space-y-1 pt-2 border-t border-white/10">
              <span className="text-xs text-blue-200 block">
                Tổng tiền nhận được khi đáo hạn (Gốc + Lãi)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {formatCurrencyVND(totalPayout)}
              </div>
            </div>

            {/* Maturity Date */}
            <div className="pt-2 flex items-center justify-between text-xs text-blue-200">
              <span>Ngày đáo hạn dự kiến:</span>
              <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">
                {formatDateVN(maturityDate)}
              </span>
            </div>
          </div>

          {/* TikTok Video Guide Box as specified in PDF 2 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Video Hướng Dẫn Gửi Tiết Kiệm
                </h4>
                <p className="text-[11px] text-slate-500">
                  Xem video TikTok hướng dẫn gửi tiết kiệm VietinBank lãi suất tối ưu
                </p>
              </div>
            </div>

            <a
              href={depositSection.tiktokVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Video className="w-4 h-4 text-pink-400" />
              <span>Xem Video trên TikTok</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
