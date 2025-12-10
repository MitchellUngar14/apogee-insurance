// Coverage types shared across all services

export interface Coverage {
  id: number;
  quoteId: number;
  productType: string;
  details?: string | null;
}

export interface CreateCoverageRequest {
  quoteId: number;
  productType: string;
  details?: string;
}

export interface UpdateCoverageRequest {
  productType?: string;
  details?: string;
}
