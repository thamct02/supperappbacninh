import React from 'react';
import contentData from '../data/contentData.json';
import { Phone, CheckCircle, LogOut } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onEndSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onEndSession
}) => {
  const { brand } = contentData;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Zone */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('faq')}
              className="flex items-center gap-3 text-left focus:outline-hidden group"
              title="Về trang chủ VietinBank"
            >
              <img
                src={brand.logoUrl}
                alt="VietinBank Logo"
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-102"
                loading="eager"
              />
              <div className="hidden sm:block border-l border-slate-200 pl-3">
                <span className="block text-xs font-semibold tracking-wider text-[#00529C] uppercase">
                  Quầy Giao Dịch Số
                </span>
                <span className="block text-[11px] text-slate-500">
                  Hỗ trợ tương tác khách hàng
                </span>
              </div>
            </button>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Consultant badge */}
            <a
              href={`tel:${brand.supportConsultant.phoneRaw}`}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50/80 hover:bg-blue-100/80 border border-blue-100 text-xs font-medium text-[#00529C] transition-colors"
              title="Gọi chuyên viên tư vấn hỗ trợ"
            >
              <Phone className="w-3.5 h-3.5 text-[#00529C]" />
              <span>
                Tư vấn viên: <strong className="font-semibold">{brand.supportConsultant.name}</strong> ({brand.supportConsultant.phone})
              </span>
            </a>

            {/* General Hotline */}
            <a
              href={`tel:${brand.hotline.replace(/\s+/g, '')}`}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Tổng đài: <strong>{brand.hotline}</strong></span>
            </a>

            {/* End session / Kết thúc cuộc trò chuyện */}
            <button
              onClick={onEndSession}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span className="whitespace-nowrap">Kết thúc</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
