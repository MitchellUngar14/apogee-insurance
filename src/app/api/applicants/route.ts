// src/app/api/applicants/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/quoting';
import { applicants, quotes } from '@/lib/schema'; // Ensure quotes is imported for quote creation
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
    const { firstName, middleName, lastName, birthdate, phoneNumber, email, groupId, quoteType } = body;

    if (!firstName || !lastName || !birthdate || !email || !quoteType) {
      return NextResponse.json(
        { message: 'First name, last name, birthdate, email, and quote type are required' },
        { status: 400 }
      );
    }

    // Parse birthdate string (YYYY-MM-DD) and create a UTC date object to avoid timezone issues
    const [year, month, day] = birthdate.split('-').map(Number);
    const utcBirthdate = new Date(Date.UTC(year, month - 1, day)); // month - 1 because months are 0-indexed

    const newApplicant = await db
      .insert(applicants)
      .values({
        firstName,
        middleName,
        lastName,
        birthdate: utcBirthdate,
        phoneNumber,
        email,
        groupId,
        quoteType,
        status: 'Incomplete', // Set initial status
      })
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

