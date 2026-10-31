import React, { useState } from 'react';
import contentData from '../data/contentData.json';
import { Smartphone, Download, QrCode, Check, Copy, ExternalLink, ShieldCheck, Zap, Percent, Receipt } from 'lucide-react';

export const IpaySection: React.FC = () => {
  const { ipaySection, brand } = contentData;
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // High quality QR code API URLs for instant scanning on visitor phone
  const qrIos = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    ipaySection.iosUrl
  )}&margin=10`;
  const qrAndroid = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    ipaySection.androidUrl
  )}&margin=10`;

  const copyToClipboard = (url: string, platform: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(platform);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const FEATURE_ICONS = [Zap, ShieldCheck, Percent, Receipt];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="bg-linear-to-br from-[#00529C] via-[#003B73] to-[#00274D] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>VietinBank iPay Mobile v5.0</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Trải Nghiệm Ngân Hàng Số Vạn Năng Cùng VietinBank iPay
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            {ipaySection.subtitle}. Mở tài khoản trực tuyến eKYC nhận ngay ưu đãi miễn phí chuyển tiền trọn đời và vô vàn voucher mua sắm hấp dẫn.
          </p>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-white/5 pointer-events-none blur-2xl" />
        <div className="absolute right-12 top-10 w-48 h-48 rounded-full bg-cyan-400/10 pointer-events-none blur-3xl" />
      </div>

      {/* QR Codes Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* iOS App Store */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-6 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.09 1.74-.95 2.77.99.08 2.06-.52 2.68-1.27z" />
            </svg>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">Dành cho iPhone (iOS)</h3>
            <p className="text-xs text-slate-500">Quét mã bằng Camera điện thoại iPhone</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
            <img
              src={qrIos}
              alt="Mã QR tải VietinBank iPay cho iPhone iOS"
              className="w-48 h-48 object-contain rounded-lg"
              loading="lazy"
            />
          </div>

          <div className="w-full space-y-3 pt-2">
            <a
              href={ipaySection.iosUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Tải trên App Store</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button
              onClick={() => copyToClipboard(ipaySection.iosUrl, 'ios')}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink === 'ios' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Đã sao chép liên kết</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép link tải</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Android Google Play */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-6 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-[#00529C] text-white flex items-center justify-center shadow-xs">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M3.609 1.814L13.793 12 3.61 22.186c-.378-.363-.61-.875-.61-1.446V3.26c0-.57.232-1.083.61-1.446zM15.207 13.414l2.586 2.586-12.784 7.37c-.375-.126-.695-.367-.923-.687l11.121-9.269zm0-2.828L4.086 1.317c.228-.32.548-.561.923-.687l12.784 7.37-2.586 2.586zm1.414 1.414l3.195-1.844c.957-.552.957-1.455 0-2.008l-3.195-1.844-1.414 1.414 1.414 1.414 2.828 2.828z" />
            </svg>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">Dành cho Android (Google Play)</h3>
            <p className="text-xs text-slate-500">Quét mã bằng Camera hoặc Zalo trên điện thoại Android</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
            <img
              src={qrAndroid}
              alt="Mã QR tải VietinBank iPay cho Android"
              className="w-48 h-48 object-contain rounded-lg"
              loading="lazy"
            />
          </div>

          <div className="w-full space-y-3 pt-2">
            <a
              href={ipaySection.androidUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#00529C] hover:bg-[#004080] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Tải trên Google Play</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
            </a>

            <button
              onClick={() => copyToClipboard(ipaySection.androidUrl, 'android')}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink === 'android' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Đã sao chép liên kết</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép link tải</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900">
          Tại sao Quý khách nên cài đặt VietinBank iPay?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ipaySection.features.map((feat, index) => {
            const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];
            return (
              <div key={index} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#00529C] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{feat.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
