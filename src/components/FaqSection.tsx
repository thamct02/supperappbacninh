import React, { useState } from 'react';
import contentData from '../data/contentData.json';
import { FaqCategory, GuideStep } from '../types';
import {
  KeyRound,
  CreditCard,
  ScanFace,
  FileCheck2,
  ExternalLink,
  Youtube,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Phone,
  HelpCircle,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

interface FaqSectionProps {
  onEndSession: () => void;
  onSelectOtherTab?: (tabId: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'forgot-password': KeyRound,
  'close-card': CreditCard,
  'cccd-verification': ScanFace,
  'biometrics': FileCheck2
};

export const FaqSection: React.FC<FaqSectionProps> = ({ onEndSession }) => {
  const { faqSection, brand } = contentData;
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'satisfied' | 'need_help'>('idle');
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  const handleSelectCard = (cat: FaqCategory) => {
    setSelectedCategory(cat);
    setActiveStepIndex(0);
    setFeedbackStatus('idle');
  };

  const handleBackToMenu = () => {
    setSelectedCategory(null);
    setActiveStepIndex(0);
    setFeedbackStatus('idle');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* If no category is selected: show the 4 cards and question */}
      {!selectedCategory ? (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#00529C] border border-blue-100">
              <HelpCircle className="w-3.5 h-3.5" />
              Trung Tâm Hỗ Trợ Tại Quầy
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {faqSection.promptQuestion}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              {faqSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
            {faqSection.categories.map((cat, idx) => {
              const Icon = CATEGORY_ICONS[cat.id] || HelpCircle;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCard(cat as FaqCategory)}
                  className="group relative bg-white rounded-2xl p-6 border border-slate-200/90 hover:border-[#00529C] shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#00529C] flex items-center justify-center group-hover:bg-[#00529C] group-hover:text-white transition-colors duration-200 shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-[#00529C] transition-colors">
                        {cat.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#00529C] transition-colors">
                        {idx + 1}. {cat.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#00529C]">
                    <span>Xem hướng dẫn ({cat.steps.length} bước)</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick End Action Bar */}
          <div className="flex items-center justify-center pt-6">
            <button
              onClick={onEndSession}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              Kết thúc cuộc trò chuyện
            </button>
          </div>
        </div>
      ) : (
        /* Detailed Step-by-Step Guide View */
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header & Back button */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToMenu}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Quay lại danh mục"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-xs font-semibold text-[#00529C]">Hướng dẫn chi tiết</span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {selectedCategory.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={selectedCategory.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-semibold transition-colors"
                title="Xem video trên YouTube"
              >
                <Youtube className="w-4 h-4 text-red-600" />
                <span>Xem Video YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Step tabs / progress bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-500 font-medium">
              <span>Tiến độ thực hiện</span>
              <span>
                Bước {activeStepIndex + 1} / {selectedCategory.steps.length}
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
              {selectedCategory.steps.map((s, idx) => (
                <button
                  key={s.stepNumber}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === activeStepIndex
                      ? 'bg-[#00529C]'
                      : idx < activeStepIndex
                      ? 'bg-blue-200'
                      : 'bg-slate-200'
                  }`}
                  title={`Bước ${s.stepNumber}`}
                />
              ))}
            </div>
          </div>

          {/* Current Step Content */}
          {(() => {
            const currentStep: GuideStep = selectedCategory.steps[activeStepIndex];
            return (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">
                {/* Text & Navigation controls */}
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 text-[#00529C] text-xs font-bold uppercase tracking-wider">
                      {currentStep.title}
                    </div>

                    <div className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                      {currentStep.content}
                    </div>
                  </div>

                  {/* Step Buttons */}
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                      disabled={activeStepIndex === 0}
                      className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Bước trước
                    </button>

                    <span className="text-xs text-slate-400 font-medium">
                      {activeStepIndex + 1} / {selectedCategory.steps.length}
                    </span>

                    <button
                      onClick={() =>
                        setActiveStepIndex((prev) =>
                          Math.min(selectedCategory.steps.length - 1, prev + 1)
                        )
                      }
                      disabled={activeStepIndex === selectedCategory.steps.length - 1}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#00529C] text-white hover:bg-[#004080] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Bước tiếp theo →
                    </button>
                  </div>
                </div>

                {/* Step Image */}
                <div className="md:col-span-6 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-6 flex flex-col items-center justify-center min-h-[320px]">
                  <div
                    className="relative group cursor-pointer max-w-sm rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow bg-white"
                    onClick={() => setSelectedImageModal(currentStep.imageUrl)}
                  >
                    <img
                      src={currentStep.imageUrl}
                      alt={`Minh họa ${currentStep.title}`}
                      className="w-full h-auto max-h-[360px] object-contain mx-auto"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback in case of network glitch
                        (e.target as HTMLImageElement).src =
                          'https://raw.githubusercontent.com/giadinhbanker/anh-super-app-bac-phu-tho/main/Logo%20VietinBank.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      <span>Nhấn để phóng to</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">
                    Hình ảnh minh họa thực tế trên ứng dụng VietinBank iPay
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Bottom YouTube Video Highlight */}
          <div className="bg-linear-to-r from-red-50 to-orange-50 border border-red-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Youtube className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Video Hướng Dẫn Thao Tác Trực Quan
                </h4>
                <p className="text-xs text-slate-600">
                  Xem video đầy đủ trên ứng dụng YouTube nếu bạn cần nhìn chi tiết từng thao tác
                </p>
              </div>
            </div>
            <a
              href={selectedCategory.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
            >
              <Youtube className="w-4 h-4" />
              <span>Mở Video YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Feedback & Session Termination Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="text-center space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {faqSection.satisfactionQuestion}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Đánh giá mức độ hài lòng hoặc yêu cầu cán bộ ngân hàng hỗ trợ trực tiếp tại quầy
              </p>
            </div>

            {/* Satisfaction buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setFeedbackStatus('satisfied')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  feedbackStatus === 'satisfied'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Đã ổn, tôi làm được rồi</span>
              </button>

              <button
                onClick={() => setFeedbackStatus('need_help')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  feedbackStatus === 'need_help'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>Chưa ổn, cần hỗ trợ thêm</span>
              </button>
            </div>

            {/* Feedback Message Responses */}
            {feedbackStatus === 'satisfied' && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-fadeIn">
                <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>VietinBank rất vui vì đã giải đáp được thắc mắc của Quý khách!</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Quý khách có thể quay lại menu chính để tra cứu các tiện ích khác hoặc kết thúc phiên giao dịch.
                </p>
              </div>
            )}

            {feedbackStatus === 'need_help' && (
              <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-left space-y-3 animate-fadeIn">
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {faqSection.notSatisfiedMessage}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={`tel:${brand.supportConsultant.phoneRaw}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00529C] hover:bg-[#004080] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Gọi Chuyên viên {brand.supportConsultant.name} ({brand.supportConsultant.phone})</span>
                  </a>
                </div>
              </div>
            )}

            {/* Navigation Actions: Quay lại menu chính & Kết thúc cuộc trò chuyện */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleBackToMenu}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Quay lại menu chính
              </button>

              <button
                onClick={onEndSession}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                Kết thúc cuộc trò chuyện
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedImageModal(null)}
        >
          <div className="relative max-w-2xl w-full bg-white rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">Xem ảnh phóng to</span>
              <button
                onClick={() => setSelectedImageModal(null)}
                className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-md"
              >
                Đóng ✕
              </button>
            </div>
            <img
              src={selectedImageModal}
              alt="Phóng to minh họa"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
