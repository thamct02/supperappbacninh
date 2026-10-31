import React, { useState, useMemo } from 'react';
import contentData from '../data/contentData.json';
import { formatCurrencyVND, formatNumberWithDots, parseNumberFromDots } from '../utils/format';
import { LoanScheduleRow } from '../types';
import {
  CalendarCheck,
  TrendingDown,
  Info,
  Table,
  FileSpreadsheet,
  Printer,
  X,
  ChevronRight,
  ShieldAlert,
  ArrowDownRight
} from 'lucide-react';

export const LoanCalculator: React.FC = () => {
  const { loanSection } = contentData;

  // Form Inputs
  const [propertyValueRaw, setPropertyValueRaw] = useState<string>('2000000000'); // 2 billion VND (optional)
  const [loanAmountRaw, setLoanAmountRaw] = useState<string>('1000000000'); // 1 billion VND (required input format)
  const [loanTermMonths, setLoanTermMonths] = useState<number>(36); // 36 months
  const [annualRate, setAnnualRate] = useState<number>(8.5); // 8.5%
  const [disbursementDateStr, setDisbursementDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [repaymentCycleId, setRepaymentCycleId] = useState<string>('monthly'); // monthly, quarterly, half_year, yearly
  const [paymentDayOfMonth, setPaymentDayOfMonth] = useState<number>(25); // 25th each month
  const [roundingMode, setRoundingMode] = useState<'exact' | 'thousand'>('thousand'); // Round to 1.000 VND or 1 VND

  // Modal Detailed Schedule State
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [scheduleSearch, setScheduleSearch] = useState<string>('');

  const loanAmount = parseNumberFromDots(loanAmountRaw);
  const propertyValue = parseNumberFromDots(propertyValueRaw);

  // Determine cycle divisor and step in months
  const cycleConfig = useMemo(() => {
    switch (repaymentCycleId) {
      case 'quarterly':
        return { divisor: 4, monthStep: 3, label: 'Hằng quý' };
      case 'half_year':
        return { divisor: 2, monthStep: 6, label: '6 tháng' };
      case 'yearly':
        return { divisor: 1, monthStep: 12, label: 'Hằng năm' };
      case 'monthly':
      default:
        return { divisor: 12, monthStep: 1, label: 'Hằng tháng' };
    }
  }, [repaymentCycleId]);

  // Total repayment periods count
  const totalPeriods = Math.max(1, Math.ceil(loanTermMonths / cycleConfig.monthStep));

  // Amortization Schedule Calculation Engine
  const { schedule, summary } = useMemo(() => {
    if (loanAmount <= 0 || totalPeriods <= 0) {
      return {
        schedule: [] as LoanScheduleRow[],
        summary: {
          firstPayment: 0,
          lastPayment: 0,
          totalInterest: 0,
          totalPrincipalAndInterest: 0
        }
      };
    }

    const roundVal = (val: number) => {
      if (roundingMode === 'thousand') {
        return Math.round(val / 1000) * 1000;
      }
      return Math.round(val);
    };

    const periodRate = annualRate / 100 / cycleConfig.divisor;
    const basePrincipalPerPeriod = roundVal(loanAmount / totalPeriods);

    const rows: LoanScheduleRow[] = [];
    let currentRemaining = loanAmount;
    let accumulatedPrincipal = 0;
    let totalInterest = 0;

    const disDate = new Date(disbursementDateStr || new Date());

    for (let period = 1; period <= totalPeriods; period++) {
      // Calculate repayment date
      // Example rule: Disbursement: 10/01/2026 -> 25/02/2026, 25/03/2026...
      const payDate = new Date(disDate);
      payDate.setMonth(payDate.getMonth() + period * cycleConfig.monthStep);
      // Adjust day of month
      const maxDaysInMonth = new Date(payDate.getFullYear(), payDate.getMonth() + 1, 0).getDate();
      payDate.setDate(Math.min(paymentDayOfMonth, maxDaysInMonth));

      const d = String(payDate.getDate()).padStart(2, '0');
      const m = String(payDate.getMonth() + 1).padStart(2, '0');
      const y = payDate.getFullYear();
      const dateFormatted = `${d}/${m}/${y}`;

      const interestThisPeriod = roundVal(currentRemaining * periodRate);
      let principalThisPeriod = basePrincipalPerPeriod;

      // Final period adjustment to eliminate any rounding discrepancy
      if (period === totalPeriods) {
        principalThisPeriod = loanAmount - accumulatedPrincipal;
      }

      const totalThisPeriod = principalThisPeriod + interestThisPeriod;

      rows.push({
        period,
        paymentDate: dateFormatted,
        remainingPrincipal: currentRemaining,
        principalPayment: principalThisPeriod,
        interestPayment: interestThisPeriod,
        totalPayment: totalThisPeriod
      });

      accumulatedPrincipal += principalThisPeriod;
      totalInterest += interestThisPeriod;
      currentRemaining = Math.max(0, currentRemaining - principalThisPeriod);
    }

    const firstRow = rows[0];
    const lastRow = rows[rows.length - 1];

    return {
      schedule: rows,
      summary: {
        firstPayment: firstRow ? firstRow.totalPayment : 0,
        lastPayment: lastRow ? lastRow.totalPayment : 0,
        totalInterest,
        totalPrincipalAndInterest: loanAmount + totalInterest
      }
    };
  }, [
    loanAmount,
    totalPeriods,
    annualRate,
    cycleConfig,
    disbursementDateStr,
    paymentDayOfMonth,
    roundingMode
  ]);

  // Filtered rows for modal search
  const filteredSchedule = useMemo(() => {
    if (!scheduleSearch.trim()) return schedule;
    const query = scheduleSearch.toLowerCase();
    return schedule.filter(
      (r) =>
        r.period.toString().includes(query) ||
        r.paymentDate.includes(query)
    );
  }, [schedule, scheduleSearch]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'Kỳ,Ngày trả nợ,Số gốc còn lại,Gốc trả trong kỳ,Lãi trả trong kỳ,Tổng gốc + lãi\n';
    const csvContent = schedule
      .map(
        (r) =>
          `${r.period},${r.paymentDate},${r.remainingPrincipal},${r.principalPayment},${r.interestPayment},${r.totalPayment}`
      )
      .join('\n');
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Lich_tra_no_VietinBank_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#00529C] border border-blue-100">
          <CalendarCheck className="w-3.5 h-3.5" />
          Kế Hoạch Tài Chính Khoản Vay
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {loanSection.title}
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          {loanSection.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Loan Input Parameters Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center justify-between pb-2 border-b border-slate-100">
            <span>Thông số khoản vay</span>
            <span className="text-xs text-slate-400 font-normal">Nhập số trực tiếp</span>
          </h2>

          {/* 1. Property Value (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Giá trị tài sản / Bất động sản đảm bảo (Tùy chọn)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={formatNumberWithDots(propertyValueRaw)}
                onChange={(e) => setPropertyValueRaw(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="2.000.000.000"
                className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00529C] focus:outline-hidden"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                VND
              </span>
            </div>
            {propertyValue > 0 && loanAmount > 0 && (
              <span className="text-[11px] text-slate-500">
                Tỷ lệ vay / Giá trị tài sản (LTV):{' '}
                <strong className="text-[#00529C]">
                  {((loanAmount / propertyValue) * 100).toFixed(1)}%
                </strong>
              </span>
            )}
          </div>

          {/* 2. Loan Amount (Required Input Field - Redesigned without slider) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Số tiền cần vay <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-[#00529C] font-semibold">
                {formatCurrencyVND(loanAmount)}
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={formatNumberWithDots(loanAmountRaw)}
                onChange={(e) => setLoanAmountRaw(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="1.000.000.000"
                className="w-full px-4 py-3 text-base sm:text-lg font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00529C] focus:ring-2 focus:ring-blue-100 focus:outline-hidden"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                VND
              </span>
            </div>

            {/* Quick buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[200000000, 500000000, 1000000000, 2000000000, 5000000000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setLoanAmountRaw(v.toString())}
                  className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-[#00529C] text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                >
                  {v >= 1000000000 ? `${v / 1000000000} Tỷ` : `${v / 1000000} Tr`}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Term & Interest Rate in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Thời gian vay (Tháng) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="360"
                value={loanTermMonths}
                onChange={(e) => setLoanTermMonths(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00529C] focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 block">
                Tương đương {(loanTermMonths / 12).toFixed(1)} năm ({totalPeriods} kỳ trả)
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Lãi suất (% / Năm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="30"
                value={annualRate}
                onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00529C] focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 block">
                Lãi suất kỳ ({cycleConfig.label}):{' '}
                <strong>{(annualRate / cycleConfig.divisor).toFixed(2)}%</strong>
              </span>
            </div>
          </div>

          {/* 4. Dates & Payment Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Ngày giải ngân</label>
              <input
                type="date"
                value={disbursementDateStr}
                onChange={(e) => setDisbursementDateStr(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00529C] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Chu kỳ trả nợ</label>
              <select
                value={repaymentCycleId}
                onChange={(e) => setRepaymentCycleId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00529C] focus:outline-hidden cursor-pointer"
              >
                {loanSection.cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Ngày trả định kỳ</label>
              <select
                value={paymentDayOfMonth}
                onChange={(e) => setPaymentDayOfMonth(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#00529C] focus:outline-hidden cursor-pointer"
              >
                {[5, 10, 15, 20, 25, 28, 30].map((d) => (
                  <option key={d} value={d}>
                    Ngày {d} hằng tháng
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5. Rounding Option */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="font-medium">Quy tắc làm tròn:</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="rounding"
                  checked={roundingMode === 'thousand'}
                  onChange={() => setRoundingMode('thousand')}
                  className="text-[#00529C]"
                />
                <span>Làm tròn 1.000 đ</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="rounding"
                  checked={roundingMode === 'exact'}
                  onChange={() => setRoundingMode('exact')}
                  className="text-[#00529C]"
                />
                <span>Đến đơn vị đồng</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Overview Repayment Summary & "Xem chi tiết" CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-linear-to-br from-[#00529C] to-[#002855] rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-200 border-b border-white/10 pb-3 flex items-center justify-between">
              <span>Ước tính số tiền trả nợ</span>
              <span className="text-[11px] font-normal text-blue-300">Dư nợ giảm dần</span>
            </h3>

            {/* Month 1 vs Last Month payment */}
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs text-blue-200">
                  <span>Số tiền trả kỳ đầu (Cao nhất)</span>
                  <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-sm text-[10px] font-bold">
                    Kỳ 1
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                  {formatCurrencyVND(summary.firstPayment)}
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-xs text-blue-200">
                  <span>Số tiền trả kỳ cuối (Thấp nhất)</span>
                  <span className="bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-sm text-[10px] font-bold">
                    Kỳ {totalPeriods}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-300 font-mono">
                  {formatCurrencyVND(summary.lastPayment)}
                </div>
              </div>
            </div>

            {/* Aggregates */}
            <div className="space-y-2 pt-2 border-t border-white/10 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-blue-200">
                <span>Tổng tiền gốc:</span>
                <span className="font-bold text-white font-mono">{formatCurrencyVND(loanAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-blue-200">
                <span>Tổng tiền lãi phải trả:</span>
                <span className="font-bold text-amber-300 font-mono">
                  {formatCurrencyVND(summary.totalInterest)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm sm:text-base font-extrabold pt-2 border-t border-white/10">
                <span>Tổng số tiền (Gốc + Lãi):</span>
                <span className="text-white font-mono">
                  {formatCurrencyVND(summary.totalPrincipalAndInterest)}
                </span>
              </div>
            </div>

            {/* STEP 2: "Xem chi tiết" Button */}
            <button
              onClick={() => setShowScheduleModal(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-blue-50 text-[#00529C] font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Table className="w-5 h-5 text-[#00529C]" />
              <span>Xem chi tiết bảng lịch trả nợ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Principle Note */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#00529C]" />
              <span>Nguyên tắc trả gốc đều, lãi trên dư nợ giảm dần</span>
            </h4>
            <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
              {loanSection.principles.map((p, idx) => (
                <li key={idx} className="leading-relaxed">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* FULL AMORTIZATION SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
              <div>
                <span className="text-xs font-bold text-[#00529C] uppercase tracking-wider block">
                  Bảng Tính Lịch Trả Nợ Chi Tiết
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  Phương thức Dư Nợ Giảm Dần ({totalPeriods} kỳ)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  title="Xuất file CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất CSV</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  title="In trang"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>In</span>
                </button>

                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick summary & search bar */}
            <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-slate-600 font-medium">
                <span>Vốn vay: <strong className="text-slate-900">{formatCurrencyVND(loanAmount)}</strong></span>
                <span>Lãi suất: <strong className="text-slate-900">{annualRate}%/năm</strong></span>
                <span>Chu kỳ: <strong className="text-slate-900">{cycleConfig.label}</strong></span>
              </div>

              <input
                type="text"
                value={scheduleSearch}
                onChange={(e) => setScheduleSearch(e.target.value)}
                placeholder="Tìm theo kỳ hoặc ngày..."
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-[#00529C]"
              />
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-3">Kỳ</th>
                    <th className="py-3 px-3">Kỳ trả nợ</th>
                    <th className="py-3 px-3 text-right">Số gốc còn lại</th>
                    <th className="py-3 px-3 text-right">Gốc trả</th>
                    <th className="py-3 px-3 text-right">Lãi trả</th>
                    <th className="py-3 px-3 text-right font-extrabold text-[#00529C]">
                      Tổng gốc + lãi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Period 0 row as shown in reference PDF */}
                  <tr className="text-slate-400 bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold">0</td>
                    <td className="py-2.5 px-3">{disbursementDateStr}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {formatCurrencyVND(loanAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">-</td>
                    <td className="py-2.5 px-3 text-right font-mono">-</td>
                    <td className="py-2.5 px-3 text-right font-mono">-</td>
                  </tr>

                  {filteredSchedule.map((row) => (
                    <tr
                      key={row.period}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-800">{row.period}</td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {row.paymentDate}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {formatCurrencyVND(row.remainingPrincipal)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800 font-semibold">
                        {formatCurrencyVND(row.principalPayment)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-700">
                        {formatCurrencyVND(row.interestPayment)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#00529C]">
                        {formatCurrencyVND(row.totalPayment)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#00529C] text-white font-extrabold text-xs sm:text-sm">
                    <td colSpan={3} className="py-3.5 px-3 uppercase tracking-wider">
                      TỔNG CỘNG ({totalPeriods} KỲ)
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono">
                      {formatCurrencyVND(loanAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-amber-300">
                      {formatCurrencyVND(summary.totalInterest)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-white text-sm sm:text-base">
                      {formatCurrencyVND(summary.totalPrincipalAndInterest)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>* Bảng tính mang tính chất tham khảo dựa trên quy định lãi suất hiện hành.</span>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Đóng bảng tính
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
