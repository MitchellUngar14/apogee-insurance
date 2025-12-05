// src/app/api/applicants/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { applicants } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> } // Updated type signature
) {
  let id: string = 'unknown'; // Declare and initialize id here
  try {
    const resolvedParams = await Promise.resolve(context.params); // Explicitly await context.params
    id = resolvedParams.id; // Assign to the outer-scoped id
    const applicantId = parseInt(id, 10);

    if (isNaN(applicantId)) {
      return NextResponse.json({ message: 'Invalid Applicant ID' }, { status: 400 });
    }

    const body = await request.json();
    const { firstName, middleName, lastName, birthdate, phoneNumber, email, status } = body;

    // Construct update object with only provided fields
    const updateData: Record<string, any> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (middleName !== undefined) updateData.middleName = middleName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (birthdate !== undefined) updateData.birthdate = new Date(birthdate); // Convert to Date object
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (email !== undefined) updateData.email = email;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updatedApplicants = await db
      .update(applicants)
      .set(updateData)
      .where(eq(applicants.id, applicantId))
      .returning();

    if (!updatedApplicants.length) {
      return NextResponse.json({ message: 'Applicant not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json(updatedApplicants[0], { status: 200 });
  } catch (error) {
    console.error(`Error updating applicant ${id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error },
      { status: 500 }
    );
  }
}
