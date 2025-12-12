// Policy Holder API - Update policy holder details
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { policyHolders } from '../../../../lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let id: string = 'unknown';
  try {
    const resolvedParams = await context.params;
    id = resolvedParams.id;
    const holderId = parseInt(id, 10);

    if (isNaN(holderId)) {
      return NextResponse.json({ message: 'Invalid Policy Holder ID' }, { status: 400 });
    }

    const holder = await db
      .select()
      .from(policyHolders)
      .where(eq(policyHolders.id, holderId))
      .execute();

    if (!holder.length) {
      return NextResponse.json({ message: 'Policy holder not found' }, { status: 404 });
    }

    return NextResponse.json(holder[0], { status: 200 });
  } catch (error) {
    console.error(`Error fetching policy holder ${id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let id: string = 'unknown';
  try {
    const resolvedParams = await context.params;
    id = resolvedParams.id;
    const holderId = parseInt(id, 10);

    if (isNaN(holderId)) {
      return NextResponse.json({ message: 'Invalid Policy Holder ID' }, { status: 400 });
    }

    const body = await request.json();
    const { firstName, middleName, lastName, email, phoneNumber, birthdate } = body;

    const updateData: Record<string, any> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (middleName !== undefined) updateData.middleName = middleName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (birthdate !== undefined) updateData.birthdate = birthdate ? new Date(birthdate) : null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updatedHolder = await db
      .update(policyHolders)
      .set(updateData)
      .where(eq(policyHolders.id, holderId))
      .returning();

    if (!updatedHolder.length) {
      return NextResponse.json({ message: 'Policy holder not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json(updatedHolder[0], { status: 200 });
  } catch (error) {
    console.error(`Error updating policy holder ${id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
