// src/app/api/quotes/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/quoting';
import { quotes, applicants, groups, coverages } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> } // Updated type signature
) {
  let id: string = 'unknown'; // Declare and initialize id here
  try {
    const resolvedParams = await Promise.resolve(context.params); // Explicitly await context.params
    id = resolvedParams.id; // Assign to the outer-scoped id
    const quoteId = parseInt(id, 10);
    if (isNaN(quoteId)) {
      return NextResponse.json({ message: 'Invalid Quote ID' }, { status: 400 });
    }

    const quote = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, quoteId))
      .execute();

    if (!quote.length) {
      return NextResponse.json({ message: 'Quote not found' }, { status: 404 });
    }

    // Fetch related data
    let relatedApplicants: typeof applicants.$inferSelect[] = [];
    let relatedGroup: typeof groups.$inferSelect | undefined;
    let relatedCoverages: typeof coverages.$inferSelect[] = [];

    if (quote[0].applicantId) {
      relatedApplicants = await db
        .select()
        .from(applicants)
        .where(eq(applicants.id, quote[0].applicantId))
        .execute();
    } else if (quote[0].groupId) {
      relatedGroup = (
        await db
          .select()
          .from(groups)
          .where(eq(groups.id, quote[0].groupId))
          .execute()
      )[0];
      relatedApplicants = await db
        .select()
        .from(applicants)
        .where(eq(applicants.groupId, quote[0].groupId))
        .execute();
    }

    relatedCoverages = await db
      .select()
      .from(coverages)
      .where(eq(coverages.quoteId, quoteId))
      .execute();

    return NextResponse.json(
      {
        quote: quote[0],
        applicant: relatedApplicants.length ? relatedApplicants[0] : null, // For individual quotes
        group: relatedGroup || null, // For group quotes
        groupApplicants: quote[0].groupId ? relatedApplicants : [], // All applicants for a group
        coverages: relatedCoverages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error fetching quote ${id}:`, error); // Use 'id' here
    return NextResponse.json(
      { message: 'Internal Server Error', error: error }, // Log full error object
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> } // Updated type signature
) {
  let id: string = 'unknown'; // Declare and initialize id here
  try {
    const resolvedParams = await Promise.resolve(context.params); // Explicitly await context.params
    id = resolvedParams.id; // Assign to the outer-scoped id
    const quoteId = parseInt(id, 10);

    if (isNaN(quoteId)) {
      return NextResponse.json({ message: 'Invalid Quote ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status, type } = body; // Fields that can be updated for a quote

    const updateData: Record<string, any> = {};
    if (status !== undefined) updateData.status = status;
    if (type !== undefined) updateData.type = type;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updatedQuotes = await db
      .update(quotes)
      .set(updateData)
      .where(eq(quotes.id, quoteId))
      .returning();

    if (!updatedQuotes.length) {
      return NextResponse.json({ message: 'Quote not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json(updatedQuotes[0], { status: 200 });
  } catch (error) {
    console.error(`Error updating quote ${id}:`, error); // Use 'id' here
    return NextResponse.json(
      { message: 'Internal Server Error', error: error },
      { status: 500 }
    );
  }
}
