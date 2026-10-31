import React, { useState } from 'react';
import contentData from '../data/contentData.json';
import { ProductItem } from '../types';
import {
  Sparkles,
  Gift,
  Star,
  Phone,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';

export const ProductsSection: React.FC = () => {
  const { productsSection, brand } = contentData;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  // Interest Dialog State
  const [interestedProduct, setInterestedProduct] = useState<ProductItem | null>(null);

  // Filter items
  const filteredItems = (productsSection.items as ProductItem[]).filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const handleNextCarousel = () => {
    setCarouselIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handlePrevCarousel = () => {
    setCarouselIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero & Description */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-linear-to-r from-blue-50 to-indigo-50 text-[#00529C] border border-blue-200 shadow-2xs">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Ưu Đãi & Dịch Vụ Độc Quyền</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {productsSection.title}
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          {productsSection.subtitle}
        </p>
      </div>

      {/* Filter Chips & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
          {productsSection.categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCarouselIndex(0);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#00529C] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Danh sách
          </button>
          <button
            onClick={() => setViewMode('carousel')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'carousel'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Carousel xoay vòng
          </button>
        </div>
      </div>

      {/* 1. GRID / VERTICAL POSTER VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-3xl border border-slate-200/90 hover:border-[#00529C] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              {/* Poster image */}
              <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://raw.githubusercontent.com/giadinhbanker/anh-super-app-bac-phu-tho/main/Logo%20VietinBank.png';
                  }}
                />
                <span className="absolute top-3 left-3 bg-[#00529C] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  {prod.badge}
                </span>
              </div>

              {/* Text content & Benefits */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#00529C] transition-colors leading-snug">
                    {prod.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 line-clamp-3 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                {prod.benefits && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    {prod.benefits.map((b, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-600 font-medium"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00529C] shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* "Tôi quan tâm" CTA Button */}
                <div className="pt-3">
                  <button
                    onClick={() => setInterestedProduct(prod)}
                    className="w-full py-3 px-4 rounded-xl bg-[#00529C] hover:bg-[#004080] text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Gift className="w-4 h-4 text-amber-300" />
                    <span>{productsSection.ctaInterested}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. CAROUSEL POSTER VIEW */}
      {viewMode === 'carousel' && filteredItems.length > 0 && (
        <div className="relative bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md">
          {(() => {
            const current = filteredItems[carouselIndex];
            return (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* Poster */}
                <div className="md:col-span-6 relative rounded-2xl overflow-hidden shadow-lg border border-slate-100 aspect-4/3 bg-slate-100">
                  <img
                    src={current.imageUrl}
                    alt={current.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute top-4 left-4 bg-[#00529C] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    {current.badge}
                  </span>
                </div>

                {/* Details */}
                <div className="md:col-span-6 space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#00529C] uppercase tracking-wider">
                      Sản phẩm {carouselIndex + 1} / {filteredItems.length}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                      {current.name}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {current.description}
                    </p>
                  </div>

                  {current.benefits && (
                    <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-xs font-bold text-slate-700 block">Ưu điểm nổi bật:</span>
                      {current.benefits.map((b, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-4">
                    <button
                      onClick={() => setInterestedProduct(current)}
                      className="flex-1 py-3.5 px-6 rounded-xl bg-[#00529C] hover:bg-[#004080] text-white font-bold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Gift className="w-4 h-4 text-amber-300" />
                      <span>{productsSection.ctaInterested}</span>
                    </button>
                  </div>

                  {/* Carousel Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={handlePrevCarousel}
                      className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1.5">
                      {filteredItems.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCarouselIndex(idx)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            idx === carouselIndex ? 'w-6 bg-[#00529C]' : 'w-2 bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={handleNextCarousel}
                      className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* "TÔI QUAN TÂM" MODAL RESPONSE AS REQUESTED IN PDF 5 */}
      {interestedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setInterestedProduct(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setInterestedProduct(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#00529C] mx-auto flex items-center justify-center shadow-xs">
              <Star className="w-9 h-9 fill-[#00529C]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#00529C] uppercase tracking-wider block">
                {interestedProduct.name}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Cảm ơn Quý khách đã quan tâm!
              </h3>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 text-left text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
              <p>
                Quý khách vui lòng liên hệ cán bộ VietinBank tại quầy giao dịch để được tư vấn và hỗ trợ đăng ký chi tiết.
              </p>
              <div className="pt-2 border-t border-blue-200/60 font-semibold text-[#00529C] flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span>Hoặc liên hệ Chuyên viên tư vấn Trần Hoàng Trung – 0973.874.232.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href={`tel:${brand.supportConsultant.phoneRaw}`}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#00529C] hover:bg-[#004080] text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Gọi chuyên viên tư vấn</span>
              </a>

              <button
                onClick={() => setInterestedProduct(null)}
                className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
