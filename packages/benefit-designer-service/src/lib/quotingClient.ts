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
