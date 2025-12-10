// Quote types shared across all services

export type QuoteStatus = 'In Progress' | 'Ready for Sale' | 'Archived';
export type QuoteType = 'Individual' | 'Group';

export interface Quote {
  id: number;
  status: QuoteStatus;
  type: QuoteType;
  applicantId: number | null;
  groupId: number | null;
  createdAt: string;
}

export interface CreateQuoteRequest {
  type: QuoteType;
  applicantId?: number;
  groupId?: number;
}

export interface UpdateQuoteRequest {
  status?: QuoteStatus;
  type?: QuoteType;
}
