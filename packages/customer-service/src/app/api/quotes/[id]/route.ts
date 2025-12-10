// Proxy to Quoting Service for individual quote operations (read-only)
import { NextResponse } from 'next/server';
import { fetchQuoteDetail } from '../../../../lib/quotingClient';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let id: string = 'unknown';
  try {
    const resolvedParams = await Promise.resolve(context.params);
    id = resolvedParams.id;
    const quoteId = parseInt(id, 10);

    if (isNaN(quoteId)) {
      return NextResponse.json({ message: 'Invalid Quote ID' }, { status: 400 });
    }

    const quoteDetail = await fetchQuoteDetail(quoteId);
    return NextResponse.json(quoteDetail, { status: 200 });
  } catch (error) {
    console.error(`Error fetching quote ${id} from Quoting Service:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch quote from Quoting Service', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Note: PATCH removed - Customer Service cannot modify quotes.
// Quote modifications should be done through the Quoting Service.
