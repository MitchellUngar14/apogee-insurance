import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { applicants, quotes } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');

    if (groupId) {
      const groupApplicants = await db
        .select()
        .from(applicants)
        .where(eq(applicants.groupId, parseInt(groupId, 10)));
      return NextResponse.json(groupApplicants, { status: 200 });
    }

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
    const {
      firstName,
      middleName,
      lastName,
      birthdate,
      phoneNumber,
      email,
      groupId,
      classId,
      quoteType,
      // Address fields
      addressLine1,
      addressLine2,
      city,
      stateProvince,
      postalCode,
      country,
    } = body;

    // For Individual quotes: email and address are required
    // For Group employees: classId is required, email is optional, address is optional
    if (quoteType === 'Individual') {
      if (!firstName || !lastName || !birthdate || !email) {
        return NextResponse.json(
          { message: 'First name, last name, birthdate, and email are required for individual applicants' },
          { status: 400 }
        );
      }
      if (!addressLine1 || !city || !country || !postalCode) {
        return NextResponse.json(
          { message: 'Address line 1, city, country, and postal code are required for individual applicants' },
          { status: 400 }
        );
      }
    } else if (quoteType === 'Group') {
      if (!firstName || !lastName || !birthdate || !classId) {
        return NextResponse.json(
          { message: 'First name, last name, birthdate, and class are required for group employees' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { message: 'Quote type must be Individual or Group' },
        { status: 400 }
      );
    }

    // Parse birthdate string (YYYY-MM-DD) and create a UTC date object
    const [year, month, day] = birthdate.split('-').map(Number);
    const utcBirthdate = new Date(Date.UTC(year, month - 1, day));

    const newApplicant = await db
      .insert(applicants)
      .values({
        firstName,
        middleName,
        lastName,
        birthdate: utcBirthdate,
        phoneNumber,
        email: email || null,
        addressLine1: addressLine1 || null,
        addressLine2: addressLine2 || null,
        city: city || null,
        stateProvince: stateProvince || null,
        postalCode: postalCode || null,
        country: country || null,
        groupId,
        classId,
        quoteType,
        status: 'Incomplete',
      })
      .returning();

    if (!newApplicant[0]) {
      throw new Error('Failed to create applicant');
    }

    // Only create a quote for Individual applicants
    // Group employees are part of an existing group quote
    if (quoteType === 'Individual') {
      const newQuote = await db
        .insert(quotes)
        .values({
          applicantId: newApplicant[0].id,
          type: 'Individual',
          status: 'In Progress',
        })
        .returning();

      return NextResponse.json(
        { applicant: newApplicant[0], quote: newQuote[0] },
        { status: 201 }
      );
    }

    // For group employees, just return the applicant
    return NextResponse.json(
      { applicant: newApplicant[0] },
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
