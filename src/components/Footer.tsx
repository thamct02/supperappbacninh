import React from 'react';
import contentData from '../data/contentData.json';
import { Phone, Shield, MapPin, Heart, LogOut } from 'lucide-react';
import { TabType } from '../types';

interface FooterProps {
  onSelectTab: (tab: TabType) => void;
  onEndSession: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onEndSession }) => {
  const { brand } = contentData;

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Col 1: Brand & Kiosk info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={brand.logoUrl}
                alt="VietinBank Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Hệ thống màn hình tương tác hỗ trợ khách hàng tại quầy giao dịch chi nhánh VietinBank. Nâng tầm trải nghiệm tài chính số hiện đại, thân thiện và minh bạch.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Bảo mật chuẩn ngân hàng số VietinBank iPay</span>
            </div>
          </div>

          {/* Col 2: Support Consultant Info */}
          <div className="md:col-span-4 space-y-3 bg-blue-50/70 p-4 rounded-2xl border border-blue-100">
            <span className="text-[11px] font-bold text-[#00529C] uppercase tracking-wider block">
              Cán bộ phụ trách hỗ trợ trực tiếp
            </span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                {brand.supportConsultant.title}: {brand.supportConsultant.name}
              </h4>
              <p className="text-xs text-slate-600">
                Sẵn sàng giải đáp mọi thắc mắc về hồ sơ vay vốn, mở tài khoản và sinh trắc học.
              </p>
            </div>
            <a
              href={`tel:${brand.supportConsultant.phoneRaw}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00529C] hover:bg-[#004080] text-white text-xs font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Gọi ngay: {brand.supportConsultant.phone}</span>
            </a>
          </div>

          {/* Col 3: Counter Session Control */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Thao tác quầy giao dịch
            </span>
            <button
              onClick={onEndSession}
              className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span>Kết thúc cuộc trò chuyện</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Nhấn khi bạn đã hoàn tất giao dịch tại quầy
            </p>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} {brand.fullName}. Bảo lưu mọi quyền.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>{brand.slogan}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
