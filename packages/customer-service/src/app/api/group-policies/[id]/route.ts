// Group Policy Detail API
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groupPolicies, policyClasses, groupMembers, classCoverages } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let id: string = 'unknown';
  try {
    const resolvedParams = await context.params;
    id = resolvedParams.id;
    const policyId = parseInt(id, 10);

    if (isNaN(policyId)) {
      return NextResponse.json({ message: 'Invalid Policy ID' }, { status: 400 });
    }

    // Fetch the policy
    const policy = await db
      .select()
      .from(groupPolicies)
      .where(eq(groupPolicies.id, policyId))
      .execute();

    if (!policy.length) {
      return NextResponse.json({ message: 'Group policy not found' }, { status: 404 });
    }

    // Fetch classes with their members and coverages
    const classesResult = await db
      .select()
      .from(policyClasses)
      .where(eq(policyClasses.groupPolicyId, policyId))
      .execute();

    const classesWithDetails = await Promise.all(
      classesResult.map(async (policyClass) => {
        const members = await db
          .select()
          .from(groupMembers)
          .where(eq(groupMembers.classId, policyClass.id))
          .execute();

        const coverages = await db
          .select()
          .from(classCoverages)
          .where(eq(classCoverages.classId, policyClass.id))
          .execute();

        return {
          ...policyClass,
          members,
          coverages,
        };
      })
    );

    return NextResponse.json(
      {
        policy: policy[0],
        classes: classesWithDetails,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error fetching group policy ${id}:`, error);
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
    const policyId = parseInt(id, 10);

    if (isNaN(policyId)) {
      return NextResponse.json({ message: 'Invalid Policy ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status, expirationDate, groupName } = body;

    const updateData: Record<string, any> = {};
    if (status !== undefined) updateData.status = status;
    if (expirationDate !== undefined) updateData.expirationDate = new Date(expirationDate);
    if (groupName !== undefined) updateData.groupName = groupName;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updatedPolicies = await db
      .update(groupPolicies)
      .set(updateData)
      .where(eq(groupPolicies.id, policyId))
      .returning();

    if (!updatedPolicies.length) {
      return NextResponse.json({ message: 'Policy not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json(updatedPolicies[0], { status: 200 });
  } catch (error) {
    console.error(`Error updating group policy ${id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let id: string = 'unknown';
  try {
    const resolvedParams = await context.params;
    id = resolvedParams.id;
    const policyId = parseInt(id, 10);

    if (isNaN(policyId)) {
      return NextResponse.json({ message: 'Invalid Policy ID' }, { status: 400 });
    }

    // Delete in order: class coverages -> group members -> classes -> policy
    const classes = await db
      .select()
      .from(policyClasses)
      .where(eq(policyClasses.groupPolicyId, policyId))
      .execute();

    for (const policyClass of classes) {
      // Delete class coverages
      await db.delete(classCoverages).where(eq(classCoverages.classId, policyClass.id));

      // Delete group members
      await db.delete(groupMembers).where(eq(groupMembers.classId, policyClass.id));
    }

    // Delete classes
    await db.delete(policyClasses).where(eq(policyClasses.groupPolicyId, policyId));

    // Delete policy
    const deleted = await db
      .delete(groupPolicies)
      .where(eq(groupPolicies.id, policyId))
      .returning();

    if (!deleted.length) {
      return NextResponse.json({ message: 'Policy not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Group policy deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting group policy ${id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
