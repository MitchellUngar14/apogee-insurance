// All Policies API - Returns both Individual and Group policies
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { individualPolicies, groupPolicies, policyHolders } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const [individual, group] = await Promise.all([
      db.select().from(individualPolicies),
      db.select().from(groupPolicies),
    ]);

    // Fetch policy holders for individual policies to get names
    const individualWithNames = await Promise.all(
      individual.map(async (p) => {
        const holder = await db
          .select()
          .from(policyHolders)
          .where(eq(policyHolders.policyId, p.id))
          .execute();

        const holderName = holder[0]
          ? `${holder[0].firstName} ${holder[0].middleName ? holder[0].middleName + ' ' : ''}${holder[0].lastName}`.trim()
          : 'Unknown';

        return {
          ...p,
          type: 'Individual' as const,
          displayName: holderName,
        };
      })
    );

    // Group policies already have groupName
    const groupWithType = group.map((p) => ({
      ...p,
      type: 'Group' as const,
      displayName: p.groupName,
    }));

    // Combine and sort by createdAt descending
    const allPolicies = [...individualWithNames, ...groupWithType].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(
      {
        policies: allPolicies,
        counts: {
          individual: individual.length,
          group: group.length,
          total: allPolicies.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
