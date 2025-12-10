// Proxy to Quoting Service
import { NextResponse } from 'next/server';
import { fetchQuotes, fetchApplicants, fetchGroups } from '@/lib/quotingClient';

export async function GET() {
  try {
    // Fetch all data from Quoting Service
    const [quotes, applicants, groups] = await Promise.all([
      fetchQuotes(),
      fetchApplicants(),
      fetchGroups(),
    ]);

    return NextResponse.json({ quotes, applicants, groups }, { status: 200 });
  } catch (error) {
    console.error('Error fetching quotes from Quoting Service:', error);
    return NextResponse.json(
      { message: 'Failed to fetch quotes from Quoting Service', error: (error as Error).message },
      { status: 500 }
    );
  }
}
