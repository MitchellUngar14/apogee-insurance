import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quoteBenefits } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET all quote benefits (optionally filter by quoteId)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const quoteId = searchParams.get('quoteId');

    if (quoteId) {
      const benefits = await db
        .select()
        .from(quoteBenefits)
        .where(eq(quoteBenefits.quoteId, parseInt(quoteId, 10)));
      return NextResponse.json(benefits);
    }

    const allBenefits = await db.select().from(quoteBenefits);
    return NextResponse.json(allBenefits);
  } catch (error) {
    console.error('Error fetching quote benefits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote benefits' },
      { status: 500 }
    );
  }
}

// POST create new quote benefit
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      quoteId,
      templateDbId,
      templateUuid,
      templateName,
      templateVersion,
      categoryName,
      categoryIcon,
      fieldSchema,
      configuredValues,
      instanceNumber = 1,
    } = body;

    // Validate required fields
    if (!quoteId || !templateDbId || !templateUuid || !templateName || !templateVersion || !categoryName || !fieldSchema) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newBenefit] = await db
      .insert(quoteBenefits)
      .values({
        quoteId,
        templateDbId,
        templateUuid,
        templateName,
        templateVersion,
        categoryName,
        categoryIcon: categoryIcon || null,
        fieldSchema,
        configuredValues: configuredValues || {},
        instanceNumber,
      })
      .returning();

    return NextResponse.json(newBenefit, { status: 201 });
  } catch (error) {
    console.error('Error creating quote benefit:', error);
    return NextResponse.json(
      { error: 'Failed to create quote benefit' },
      { status: 500 }
    );
  }
}
