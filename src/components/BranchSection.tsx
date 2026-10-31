import React, { useState } from 'react';
import contentData from '../data/contentData.json';
import { BranchItem, OfficeItem } from '../types';
import {
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  Search,
  Building2,
  Navigation,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const BranchSection: React.FC = () => {
  const { branchSection } = contentData;
  const [selectedBranchId, setSelectedBranchId] = useState<string>('bac-ninh');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  const currentBranch =
    (branchSection.branches as BranchItem[]).find((b) => b.id === selectedBranchId) ||
    branchSection.branches[0];

  const filteredOffices = (currentBranch.offices as OfficeItem[]).filter(
    (off) =>
      off.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#00529C] border border-blue-100">
          <MapPin className="w-3.5 h-3.5" />
          Mạng Lưới Chi Nhánh & Phòng Giao Dịch
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {branchSection.title}
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          {branchSection.subtitle}
        </p>
      </div>

      {/* Working Hours Card (Highlighted Banner) */}
      <div className="bg-linear-to-r from-blue-900 via-[#00529C] to-sky-900 rounded-3xl p-6 text-white shadow-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-cyan-300" />
          </div>
          <div>
            <h3 className="font-bold text-base">Thời Gian Giao Dịch</h3>
            <span className="text-xs text-blue-200">Áp dụng toàn bộ hệ thống</span>
          </div>
        </div>

        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 space-y-1">
            <div className="font-bold text-cyan-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{branchSection.workingHours.weekdays.days}</span>
            </div>
            <div className="text-white/90 pl-5 space-y-0.5">
              <p>{branchSection.workingHours.weekdays.morning}</p>
              <p>{branchSection.workingHours.weekdays.afternoon}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{branchSection.workingHours.weekend.days}</span>
            </div>
            <div className="text-white/90 pl-5">
              <p className="font-medium text-amber-200">{branchSection.workingHours.weekend.status}</p>
              <p className="text-[11px] text-blue-200">(Hỗ trợ 24/7 qua VietinBank iPay & Hotline 1900 558 868)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Selection Tabs & Search Filter */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Branch Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Khu vực:</span>
            {branchSection.branches.map((b) => {
              const isSelected = selectedBranchId === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBranchId(b.id);
                    setSearchQuery('');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#00529C] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên PGD hoặc địa chỉ..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00529C] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Office Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {filteredOffices.map((office, idx) => (
            <div
              key={office.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-[#00529C] shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Photo & Header */}
              <div className="flex flex-col sm:flex-row gap-4 p-5">
                <div
                  className="sm:w-36 h-32 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 cursor-pointer relative"
                  onClick={() => setSelectedImageModal(office.imageUrl)}
                >
                  <img
                    src={office.imageUrl}
                    alt={office.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://pub-8db548912e6649bbabeb3b571024571e.r2.dev/Anh-CN/Bac-Ninh/Tru-so.jpg';
                    }}
                  />
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-sm">
                    Phóng to
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#00529C]">
                      {office.type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">#{idx + 1}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#00529C] transition-colors leading-snug">
                    {office.name}
                  </h3>

                  <p className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{office.address}</span>
                  </p>
                </div>
              </div>

              {/* Action Bar (Hotline Click-to-call & Google Maps) */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Click to call Hotline */}
                <a
                  href={`tel:${office.hotlineRaw}`}
                  className="flex items-center gap-1.5 font-bold text-[#00529C] hover:text-[#003B73] transition-colors"
                  title="Nhấn để gọi trực tiếp"
                >
                  <Phone className="w-3.5 h-3.5 text-[#00529C]" />
                  <span>Hotline: {office.hotline}</span>
                </a>

                {/* Google Maps External Link */}
                <a
                  href={office.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#00529C] font-semibold transition-colors shadow-2xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          ))}

          {filteredOffices.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm">
              Không tìm thấy phòng giao dịch phù hợp với từ khóa "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedImageModal(null)}
        >
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">Hình ảnh phòng giao dịch</span>
              <button
                onClick={() => setSelectedImageModal(null)}
                className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-md"
              >
                Đóng ✕
              </button>
            </div>
            <img
              src={selectedImageModal}
              alt="Chi nhánh VietinBank"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
