// API contracts for inter-service communication

import type { Quote } from './quote';
import type { Applicant } from './applicant';
import type { Group } from './group';
import type { Coverage } from './coverage';
import type { EmployeeClass } from './employee-class';

// Quoting Service API responses

export interface GetQuotesResponse {
  quotes: Quote[];
}

export interface GetQuoteDetailResponse {
  quote: Quote;
  applicant: Applicant | null;
  group: Group | null;
  groupApplicants: Applicant[];
  employeeClasses: EmployeeClass[];
  coverages: Coverage[];
}

export interface CreateApplicantResponse {
  applicant: Applicant;
  quote: Quote;
}

export interface CreateGroupResponse {
  group: Group;
  quote: Quote;
}

// Error response
export interface ApiError {
  error: string;
  details?: string;
}
