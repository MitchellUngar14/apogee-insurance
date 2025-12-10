// Convert a quote to a policy (Individual or Group)
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import {
  individualPolicies,
  policyHolders,
  individualPolicyCoverages,
  groupPolicies,
  policyClasses,
  groupMembers,
  classCoverages,
} from '../../../lib/schema';
import { fetchQuoteDetail, archiveQuote } from '../../../lib/quotingClient';
import { generatePolicyNumber } from '@apogee/shared';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quoteId, effectiveDate, expirationDate, classes: classDefinitions } = body;

    if (!quoteId || !effectiveDate) {
      return NextResponse.json(
        { message: 'Quote ID and effective date are required' },
        { status: 400 }
      );
    }

    // Fetch the quote details from Quoting Service
    const quoteDetail = await fetchQuoteDetail(quoteId);

    if (!quoteDetail.quote) {
      return NextResponse.json(
        { message: 'Quote not found' },
        { status: 404 }
      );
    }

    if (quoteDetail.quote.status !== 'Ready for Sale') {
      return NextResponse.json(
        { message: 'Quote must be in "Ready for Sale" status to convert' },
        { status: 400 }
      );
    }

    const policyNumber = generatePolicyNumber();

    if (quoteDetail.quote.type === 'Individual') {
      // --- INDIVIDUAL POLICY CONVERSION ---
      const result = await convertIndividualQuote({
        quoteDetail,
        policyNumber,
        effectiveDate,
        expirationDate,
      });

      await archiveQuote(quoteId);

      return NextResponse.json(
        {
          message: 'Individual quote converted to policy successfully',
          policy: result.policy,
          policyNumber,
        },
        { status: 201 }
      );
    } else {
      // --- GROUP POLICY CONVERSION ---
      if (!classDefinitions || !Array.isArray(classDefinitions) || classDefinitions.length === 0) {
        return NextResponse.json(
          { message: 'Class definitions are required for group policy conversion' },
          { status: 400 }
        );
      }

      const result = await convertGroupQuote({
        quoteDetail,
        policyNumber,
        effectiveDate,
        expirationDate,
        classDefinitions,
      });

      await archiveQuote(quoteId);

      return NextResponse.json(
        {
          message: 'Group quote converted to policy successfully',
          policy: result.policy,
          policyNumber,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error converting quote to policy:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Convert Individual Quote to Individual Policy
async function convertIndividualQuote({
  quoteDetail,
  policyNumber,
  effectiveDate,
  expirationDate,
}: {
  quoteDetail: Awaited<ReturnType<typeof fetchQuoteDetail>>;
  policyNumber: string;
  effectiveDate: string;
  expirationDate?: string;
}) {
  // Create the individual policy
  const newPolicy = await db
    .insert(individualPolicies)
    .values({
      policyNumber,
      sourceQuoteId: quoteDetail.quote.id,
      effectiveDate: new Date(effectiveDate),
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      status: 'Active',
    })
    .returning();

  if (!newPolicy[0]) {
    throw new Error('Failed to create individual policy');
  }

  const policyId = newPolicy[0].id;

  // Create policy holder from applicant
  if (quoteDetail.applicant) {
    if (!quoteDetail.applicant.email) {
      throw new Error('Applicant email is required to create a policy holder');
    }
    await db.insert(policyHolders).values({
      policyId,
      firstName: quoteDetail.applicant.firstName,
      middleName: quoteDetail.applicant.middleName,
      lastName: quoteDetail.applicant.lastName,
      email: quoteDetail.applicant.email,
      birthdate: quoteDetail.applicant.birthdate ? new Date(quoteDetail.applicant.birthdate) : null,
      phoneNumber: quoteDetail.applicant.phoneNumber,
      sourceApplicantId: quoteDetail.applicant.id,
    });
  }

  // Create policy coverages
  if (quoteDetail.coverages && quoteDetail.coverages.length > 0) {
    await db.insert(individualPolicyCoverages).values(
      quoteDetail.coverages.map((coverage) => ({
        policyId,
        productType: coverage.productType,
        details: coverage.details,
        premium: null,
      }))
    );
  }

  return { policy: newPolicy[0] };
}

// Convert Group Quote to Group Policy
async function convertGroupQuote({
  quoteDetail,
  policyNumber,
  effectiveDate,
  expirationDate,
  classDefinitions,
}: {
  quoteDetail: Awaited<ReturnType<typeof fetchQuoteDetail>>;
  policyNumber: string;
  effectiveDate: string;
  expirationDate?: string;
  classDefinitions: {
    className: string;
    description?: string;
    memberIds: number[];
    coverages: {
      productType: string;
      details?: string;
      premium?: string;
    }[];
  }[];
}) {
  // Create the group policy
  const newPolicy = await db
    .insert(groupPolicies)
    .values({
      policyNumber,
      sourceQuoteId: quoteDetail.quote.id,
      sourceGroupId: quoteDetail.group?.id,
      groupName: quoteDetail.group?.groupName || 'Unknown Group',
      effectiveDate: new Date(effectiveDate),
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      status: 'Active',
    })
    .returning();

  if (!newPolicy[0]) {
    throw new Error('Failed to create group policy');
  }

  const groupPolicyId = newPolicy[0].id;

  // Create classes with members and coverages
  for (const classDef of classDefinitions) {
    // Create the class
    const newClass = await db
      .insert(policyClasses)
      .values({
        groupPolicyId,
        className: classDef.className,
        description: classDef.description,
      })
      .returning();

    if (!newClass[0]) {
      throw new Error(`Failed to create class: ${classDef.className}`);
    }

    const classId = newClass[0].id;

    // Add members to this class
    const membersForClass = quoteDetail.groupApplicants.filter(
      (applicant) => classDef.memberIds.includes(applicant.id)
    );

    if (membersForClass.length > 0) {
      await db.insert(groupMembers).values(
        membersForClass.map((applicant) => ({
          classId,
          firstName: applicant.firstName,
          middleName: applicant.middleName,
          lastName: applicant.lastName,
          email: applicant.email || "",
          birthdate: applicant.birthdate ? new Date(applicant.birthdate) : null,
          phoneNumber: applicant.phoneNumber,
          sourceApplicantId: applicant.id,
        }))
      );
    }

    // Add coverages to this class
    if (classDef.coverages && classDef.coverages.length > 0) {
      await db.insert(classCoverages).values(
        classDef.coverages.map((coverage) => ({
          classId,
          productType: coverage.productType,
          details: coverage.details,
          premium: coverage.premium,
        }))
      );
    }
  }

  return { policy: newPolicy[0] };
}
