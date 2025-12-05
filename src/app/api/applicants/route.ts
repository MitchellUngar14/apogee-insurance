// src/app/api/applicants/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { applicants } from '@/lib/schema';
import { eq } from 'drizzle-orm';

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, groupId, quoteType } = body; // Get quoteType from body

    if (!fullName || !email || !quoteType) {
      return NextResponse.json(
        { message: 'Full name, email, and quote type are required' },
        { status: 400 }
      );
    }

    const newApplicant = await db
      .insert(applicants)
      .values({ fullName, email, groupId, quoteType })
      .returning();

    if (!newApplicant[0]) {
      throw new Error('Failed to create applicant');
    }

    // Create a new quote associated with this applicant
    const newQuote = await db
      .insert(quotes)
      .values({
        applicantId: newApplicant[0].id,
        type: 'Individual', // Always Individual for this endpoint
        status: 'In Progress',
      })
      .returning();

    return NextResponse.json(
      { applicant: newApplicant[0], quote: newQuote[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating applicant or quote:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

