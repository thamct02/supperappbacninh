export type TabType = 'faq' | 'ipay' | 'game' | 'deposit' | 'loan' | 'products' | 'branches';

export interface GuideStep {
  stepNumber: number;
  title: string;
  content: string;
  imageUrl: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  badge: string;
  description: string;
  videoUrl: string;
  steps: GuideStep[];
}

export interface ProductItem {
  id: string;
  category: string;
  name: string;
  badge: string;
  imageUrl: string;
  description: string;
  benefits: string[];
}

export interface OfficeItem {
  id: string;
  type: string;
  name: string;
  address: string;
  hotline: string;
  hotlineRaw: string;
  imageUrl: string;
  googleMapsUrl: string;
}

export interface BranchItem {
  id: string;
  name: string;
  offices: OfficeItem[];
}

export interface LoanScheduleRow {
  period: number;
  paymentDate: string;
  remainingPrincipal: number;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
}
