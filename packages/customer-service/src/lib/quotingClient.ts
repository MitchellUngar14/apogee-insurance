// HTTP Client for communicating with Quoting Service
import type {
  Quote,
  Applicant,
  Group,
  Coverage,
  GetQuoteDetailResponse,
  UpdateQuoteRequest,
  UpdateApplicantRequest
} from '@apogee/shared';

const QUOTING_SERVICE_URL = process.env.QUOTING_SERVICE_URL || 'http://localhost:3001';
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || 'dev-secret-key';

const headers = {
  'X-Service-Key': INTERNAL_SERVICE_KEY,
  'Content-Type': 'application/json',
};

// Fetch all quotes from Quoting Service
export async function fetchQuotes(): Promise<Quote[]> {
  const response = await fetch(`${QUOTING_SERVICE_URL}/api/quotes`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch quotes: ${response.statusText}`);
  }
  return response.json();
}

// Fetch single quote with details from Quoting Service
export async function fetchQuoteDetail(id: number): Promise<GetQuoteDetailResponse> {
  const response = await fetch(`${QUOTING_SERVICE_URL}/api/quotes/${id}`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch quote ${id}: ${response.statusText}`);
  }
  return response.json();
}

// Update quote status in Quoting Service
export async function updateQuote(id: number, data: UpdateQuoteRequest): Promise<Quote> {
  const response = await fetch(`${QUOTING_SERVICE_URL}/api/quotes/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update quote ${id}: ${response.statusText}`);
  }
  return response.json();
}

// Fetch all applicants from Quoting Service
export async function fetchApplicants(): Promise<Applicant[]> {
  const response = await fetch(`${QUOTING_SERVICE_URL}/api/applicants`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch applicants: ${response.statusText}`);
  }
  return response.json();
}

// Update applicant in Quoting Service
export async function updateApplicant(id: number, data: UpdateApplicantRequest): Promise<Applicant> {
  const response = await fetch(`${QUOTING_SERVICE_URL}/api/applicants/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update applicant ${id}: ${response.statusText}`);
  }
  return response.json();
}

// Fetch all groups from Quoting Service
export async function fetchGroups(): Promise<Group[]> {
  const response = await fetch(`${QUOTING_SERVICE_URL}/api/groups`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch groups: ${response.statusText}`);
  }
  return response.json();
}

// Fetch all coverages from Quoting Service
export async function fetchCoverages(): Promise<Coverage[]> {
  const response = await fetch(`${QUOTING_SERVICE_URL}/api/coverages`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch coverages: ${response.statusText}`);
  }
  return response.json();
}

// Archive a quote after conversion to policy
export async function archiveQuote(id: number): Promise<Quote> {
  return updateQuote(id, { status: 'Archived' });
}
