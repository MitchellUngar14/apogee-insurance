// Group Policies API
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { groupPolicies, policyClasses, groupMembers, classCoverages } from '../../../lib/schema';

export async function GET() {
  try {
    const policies = await db.select().from(groupPolicies);
    return NextResponse.json(policies, { status: 200 });
  } catch (error) {
    console.error('Error fetching group policies:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { policyNumber, sourceQuoteId, sourceGroupId, groupName, effectiveDate, expirationDate, classes } = body;

    if (!policyNumber || !sourceQuoteId || !groupName || !effectiveDate) {
      return NextResponse.json(
        { message: 'Policy number, source quote ID, group name, and effective date are required' },
        { status: 400 }
      );
    }

    // Create the group policy
    const newPolicy = await db
      .insert(groupPolicies)
      .values({
        policyNumber,
        sourceQuoteId,
        sourceGroupId,
        groupName,
        effectiveDate: new Date(effectiveDate),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        status: 'Active',
      })
      .returning();

    if (!newPolicy[0]) {
      throw new Error('Failed to create group policy');
    }

    const groupPolicyId = newPolicy[0].id;

    // Create classes with members and coverages if provided
    if (classes && Array.isArray(classes)) {
      for (const classDef of classes) {
        const newClass = await db
          .insert(policyClasses)
          .values({
            groupPolicyId,
            className: classDef.className,
            description: classDef.description,
          })
          .returning();

        if (!newClass[0]) continue;

        const classId = newClass[0].id;

        // Add members to this class
        if (classDef.members && Array.isArray(classDef.members) && classDef.members.length > 0) {
          await db.insert(groupMembers).values(
            classDef.members.map((member: any) => ({
              classId,
              firstName: member.firstName,
              middleName: member.middleName,
              lastName: member.lastName,
              email: member.email,
              birthdate: member.birthdate ? new Date(member.birthdate) : null,
              phoneNumber: member.phoneNumber,
              sourceApplicantId: member.sourceApplicantId,
            }))
          );
        }

        // Add coverages to this class
        if (classDef.coverages && Array.isArray(classDef.coverages) && classDef.coverages.length > 0) {
          await db.insert(classCoverages).values(
            classDef.coverages.map((coverage: any) => ({
              classId,
              productType: coverage.productType,
              details: coverage.details,
              premium: coverage.premium,
            }))
          );
        }
      }
    }

    return NextResponse.json({ policy: newPolicy[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating group policy:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
