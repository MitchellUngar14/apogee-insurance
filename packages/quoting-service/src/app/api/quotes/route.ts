import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quotes } from '@/lib/schema';

export async function GET() {
  try {
    const allQuotes = await db.select().from(quotes);
    return NextResponse.json(allQuotes, { status: 200 });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
