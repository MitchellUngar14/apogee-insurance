// Benefit types for Benefit Designer Service

import type { QuoteType } from './quote';

export type BenefitPlanStatus = 'Draft' | 'Active' | 'Archived';

export interface BenefitPlan {
  id: number;
  planName: string;
  planType: QuoteType;
  status: BenefitPlanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductConfiguration {
  id: number;
  benefitPlanId: number;
  productType: string;
  configDetails?: string | null;
  premiumBase?: string | null;
  createdAt: string;
}

export interface CreateBenefitPlanRequest {
  planName: string;
  planType: QuoteType;
}

export interface UpdateBenefitPlanRequest {
  planName?: string;
  status?: BenefitPlanStatus;
}

export interface CreateProductConfigRequest {
  benefitPlanId: number;
  productType: string;
  configDetails?: string;
  premiumBase?: string;
}

export interface UpdateProductConfigRequest {
  productType?: string;
  configDetails?: string;
  premiumBase?: string;
}
