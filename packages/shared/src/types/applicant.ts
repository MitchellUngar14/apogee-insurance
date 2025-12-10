// Applicant types shared across all services

import type { QuoteType } from './quote';

export type ApplicantStatus = 'Incomplete' | 'Complete';

export interface Applicant {
  id: number;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  birthdate: string;
  phoneNumber?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  stateProvince?: string | null;
  postalCode?: string | null;
  country?: string | null;
  groupId: number | null;
  classId?: number | null;
  quoteType: QuoteType | null;
  status: ApplicantStatus;
  createdAt: string;
}

export interface CreateApplicantRequest {
  firstName: string;
  lastName: string;
  birthdate: string;
  email: string;
  middleName?: string;
  phoneNumber?: string;
  groupId?: number;
  quoteType: QuoteType;
}

export interface UpdateApplicantRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  birthdate?: string;
  phoneNumber?: string;
  email?: string;
  status?: ApplicantStatus;
}
