// Individual Policies API
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { individualPolicies, policyHolders, individualPolicyCoverages } from '@/lib/schema';

export async function GET() {
  try {
    const policies = await db.select().from(individualPolicies);
    return NextResponse.json(policies, { status: 200 });
  } catch (error) {
    console.error('Error fetching individual policies:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { policyNumber, sourceQuoteId, effectiveDate, expirationDate, holder, coverages } = body;

    if (!policyNumber || !sourceQuoteId || !effectiveDate) {
      return NextResponse.json(
        { message: 'Policy number, source quote ID, and effective date are required' },
        { status: 400 }
      );
    }

    // Create the individual policy
    const newPolicy = await db
      .insert(individualPolicies)
      .values({
        policyNumber,
        sourceQuoteId,
        effectiveDate: new Date(effectiveDate),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        status: 'Active',
      })
      .returning();

    if (!newPolicy[0]) {
      throw new Error('Failed to create individual policy');
    }

    const policyId = newPolicy[0].id;

    // Create policy holder if provided
    if (holder) {
      await db.insert(policyHolders).values({
        policyId,
        firstName: holder.firstName,
        middleName: holder.middleName,
        lastName: holder.lastName,
        email: holder.email,
        birthdate: holder.birthdate ? new Date(holder.birthdate) : null,
        phoneNumber: holder.phoneNumber,
        sourceApplicantId: holder.sourceApplicantId,
      });
    }

    // Create policy coverages if provided
    if (coverages && Array.isArray(coverages) && coverages.length > 0) {
      await db.insert(individualPolicyCoverages).values(
        coverages.map((coverage: { productType: string; details?: string; premium?: string }) => ({
          policyId,
          productType: coverage.productType,
          details: coverage.details,
          premium: coverage.premium,
        }))
      );
    }

    return NextResponse.json({ policy: newPolicy[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating individual policy:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
