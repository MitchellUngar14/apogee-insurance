// src/app/api/coverages/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/quoting';
import { coverages } from '@/lib/schema';

export async function GET() {
  try {
    const allCoverages = await db.select().from(coverages);
    return NextResponse.json(allCoverages, { status: 200 });
  } catch (error) {
    console.error('Error fetching coverages:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
