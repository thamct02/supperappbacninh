import React, { useState, useEffect, useRef } from 'react';
import { TabType } from './types';
import contentData from './data/contentData.json';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { FaqSection } from './components/FaqSection';
import { IpaySection } from './components/IpaySection';
import { GameSection } from './components/GameSection';
import { DepositCalculator } from './components/DepositCalculator';
import { LoanCalculator } from './components/LoanCalculator';
import { ProductsSection } from './components/ProductsSection';
import { BranchSection } from './components/BranchSection';
import { Footer } from './components/Footer';
import { gsap } from 'gsap';
import {
  Heart,
  CheckCircle2,
  X,
  Phone,
  Sparkles,
  HelpCircle,
  Smartphone,
  Gamepad2,
  Calculator,
  CalendarCheck,
  MapPin
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('faq');
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const contentContainerRef = useRef<HTMLDivElement | null>(null);

  const { faqSection, brand } = contentData;

  // Animate tab transition using GSAP
  useEffect(() => {
    if (contentContainerRef.current) {
      gsap.fromTo(
        contentContainerRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
    // Scroll smoothly to top of section on tab change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleEndSession = () => {
    setShowEndModal(true);
  };

  const handleRestartSession = () => {
    setShowEndModal(false);
    setActiveTab('faq');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 selection:bg-[#00529C]/15 selection:text-[#00529C]">
      {/* Top Header Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onEndSession={handleEndSession}
      />

      {/* Navigation Sub-bar */}
      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div ref={contentContainerRef}>
          {activeTab === 'faq' && (
            <FaqSection
              onEndSession={handleEndSession}
              onSelectOtherTab={(tabId) => setActiveTab(tabId as TabType)}
            />
          )}

          {activeTab === 'ipay' && <IpaySection />}

          {activeTab === 'game' && (
            <GameSection onBackToMenu={() => setActiveTab('faq')} />
          )}

          {activeTab === 'deposit' && <DepositCalculator />}

          {activeTab === 'loan' && <LoanCalculator />}

          {activeTab === 'products' && <ProductsSection />}

          {activeTab === 'branches' && <BranchSection />}
        </div>
      </main>

      {/* Footer */}
      <Footer onSelectTab={setActiveTab} onEndSession={handleEndSession} />

      {/* "KẾT THÚC CUỘC TRÒ CHUYỆN" THANK YOU MODAL */}
      {showEndModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowEndModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEndModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-red-500 to-[#00529C] text-white mx-auto flex items-center justify-center shadow-md">
              <Heart className="w-8 h-8 fill-white" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#00529C] uppercase tracking-wider block">
                {brand.fullName}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {faqSection.endConversationMessage}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs sm:text-sm text-slate-600 space-y-2 text-left">
              <p className="font-semibold text-slate-800">
                Cần thêm thông tin hoặc giao dịch trực tiếp?
              </p>
              <p>
                Quý khách vui lòng liên hệ nhân viên tại quầy hoặc chuyên viên{' '}
                <strong>{brand.supportConsultant.name}</strong> qua hotline{' '}
                <a
                  href={`tel:${brand.supportConsultant.phoneRaw}`}
                  className="text-[#00529C] font-bold underline"
                >
                  {brand.supportConsultant.phone}
                </a>
                .
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleRestartSession}
                className="w-full py-3 px-5 rounded-xl bg-[#00529C] hover:bg-[#004080] text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
              >
                Bắt đầu phiên tương tác mới
              </button>

              <button
                onClick={() => setShowEndModal(false)}
                className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
