export function formatCurrencyVND(amount: number): string {
  if (isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumberWithDots(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) : value;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('vi-VN').format(num);
}

export function parseNumberFromDots(formattedStr: string): number {
  if (!formattedStr) return 0;
  const cleaned = formattedStr.replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

export function formatDateVN(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}
