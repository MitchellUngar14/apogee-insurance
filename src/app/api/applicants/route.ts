// src/app/api/applicants/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { applicants } from '@/lib/schema';

export async function GET() {
  try {
    const allApplicants = await db.select().from(applicants);
    return NextResponse.json(allApplicants, { status: 200 });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
