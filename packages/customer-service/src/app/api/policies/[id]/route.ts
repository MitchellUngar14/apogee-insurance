// Unified Policy Detail API - Handles both Individual and Group policies
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import {
  individualPolicies,
  policyHolders,
  individualPolicyCoverages,
  groupPolicies,
  policyClasses,
  groupMembers,
  classCoverages,
} from '../../../../lib/schema';
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

    // Try to find in individual policies first
    const individualPolicy = await db
      .select()
      .from(individualPolicies)
      .where(eq(individualPolicies.id, policyId))
      .execute();

    if (individualPolicy.length > 0) {
      // It's an individual policy
      const policy = individualPolicy[0];

      // Fetch the policy holder
      const holders = await db
        .select()
        .from(policyHolders)
        .where(eq(policyHolders.policyId, policyId))
        .execute();

      // Fetch coverages
      const coverages = await db
        .select()
        .from(individualPolicyCoverages)
        .where(eq(individualPolicyCoverages.policyId, policyId))
        .execute();

      return NextResponse.json(
        {
          policy: { ...policy, type: 'Individual' },
          policyHolders: holders,
          policyCoverages: coverages,
        },
        { status: 200 }
      );
    }

    // Try group policies
    const groupPolicy = await db
      .select()
      .from(groupPolicies)
      .where(eq(groupPolicies.id, policyId))
      .execute();

    if (groupPolicy.length > 0) {
      // It's a group policy
      const policy = groupPolicy[0];

      // Fetch classes with their members
      const classesResult = await db
        .select()
        .from(policyClasses)
        .where(eq(policyClasses.groupPolicyId, policyId))
        .execute();

      const classesWithMembers = await Promise.all(
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

      // Flatten members for the policyHolders field (for compatibility)
      const allMembers = classesWithMembers.flatMap((c) => c.members);

      // Flatten coverages for policyCoverages field (for compatibility)
      const allCoverages = classesWithMembers.flatMap((c) => c.coverages);

      return NextResponse.json(
        {
          policy: { ...policy, type: 'Group' },
          policyHolders: allMembers,
          policyCoverages: allCoverages,
          classes: classesWithMembers,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: 'Policy not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error fetching policy ${id}:`, error);
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
    const { status, expirationDate } = body;

    const updateData: Record<string, any> = {};
    if (status !== undefined) updateData.status = status;
    if (expirationDate !== undefined) updateData.expirationDate = new Date(expirationDate);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    // Try individual policies first
    const updatedIndividual = await db
      .update(individualPolicies)
      .set(updateData)
      .where(eq(individualPolicies.id, policyId))
      .returning();

    if (updatedIndividual.length > 0) {
      return NextResponse.json({ ...updatedIndividual[0], type: 'Individual' }, { status: 200 });
    }

    // Try group policies
    const updatedGroup = await db
      .update(groupPolicies)
      .set(updateData)
      .where(eq(groupPolicies.id, policyId))
      .returning();

    if (updatedGroup.length > 0) {
      return NextResponse.json({ ...updatedGroup[0], type: 'Group' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Policy not found' }, { status: 404 });
  } catch (error) {
    console.error(`Error updating policy ${id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
