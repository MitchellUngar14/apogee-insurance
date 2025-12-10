// Individual Policy Detail API
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  individualPolicies,
  policyHolders,
  individualPolicyCoverages,
  dependents,
  dependentCoverages,
  beneficiaries,
} from '@/lib/schema';
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
      .from(individualPolicies)
      .where(eq(individualPolicies.id, policyId))
      .execute();

    if (!policy.length) {
      return NextResponse.json({ message: 'Individual policy not found' }, { status: 404 });
    }

    // Fetch the policy holder (1:1)
    const holder = await db
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

    // If there's a policy holder, fetch dependents and beneficiaries
    let dependentsList: any[] = [];
    let beneficiariesList: any[] = [];

    if (holder.length > 0) {
      const holderId = holder[0].id;

      // Fetch dependents with their coverages
      const deps = await db
        .select()
        .from(dependents)
        .where(eq(dependents.policyHolderId, holderId))
        .execute();

      dependentsList = await Promise.all(
        deps.map(async (dep) => {
          const depCoverages = await db
            .select()
            .from(dependentCoverages)
            .where(eq(dependentCoverages.dependentId, dep.id))
            .execute();
          return { ...dep, coverages: depCoverages };
        })
      );

      // Fetch beneficiaries
      beneficiariesList = await db
        .select()
        .from(beneficiaries)
        .where(eq(beneficiaries.policyHolderId, holderId))
        .execute();
    }

    return NextResponse.json(
      {
        policy: policy[0],
        policyHolder: holder[0] || null,
        dependents: dependentsList,
        beneficiaries: beneficiariesList,
        coverages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error fetching individual policy ${id}:`, error);
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

    const updatedPolicies = await db
      .update(individualPolicies)
      .set(updateData)
      .where(eq(individualPolicies.id, policyId))
      .returning();

    if (!updatedPolicies.length) {
      return NextResponse.json({ message: 'Policy not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json(updatedPolicies[0], { status: 200 });
  } catch (error) {
    console.error(`Error updating individual policy ${id}:`, error);
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

    // Delete in order: dependent coverages -> dependents -> beneficiaries -> coverages -> holder -> policy
    const holder = await db
      .select()
      .from(policyHolders)
      .where(eq(policyHolders.policyId, policyId))
      .execute();

    if (holder.length > 0) {
      const holderId = holder[0].id;

      // Delete dependent coverages
      const deps = await db.select().from(dependents).where(eq(dependents.policyHolderId, holderId)).execute();
      for (const dep of deps) {
        await db.delete(dependentCoverages).where(eq(dependentCoverages.dependentId, dep.id));
      }

      // Delete dependents
      await db.delete(dependents).where(eq(dependents.policyHolderId, holderId));

      // Delete beneficiaries
      await db.delete(beneficiaries).where(eq(beneficiaries.policyHolderId, holderId));

      // Delete policy holder
      await db.delete(policyHolders).where(eq(policyHolders.policyId, policyId));
    }

    // Delete coverages
    await db.delete(individualPolicyCoverages).where(eq(individualPolicyCoverages.policyId, policyId));

    // Delete policy
    const deleted = await db
      .delete(individualPolicies)
      .where(eq(individualPolicies.id, policyId))
      .returning();

    if (!deleted.length) {
      return NextResponse.json({ message: 'Policy not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Individual policy deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting individual policy ${id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
