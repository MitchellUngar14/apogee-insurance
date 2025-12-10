import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { quotes, applicants, groups, coverages, employeeClasses } from '../../../../lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let id: string = 'unknown';
  try {
    const resolvedParams = await Promise.resolve(context.params);
    id = resolvedParams.id;
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

    let relatedApplicants: typeof applicants.$inferSelect[] = [];
    let relatedGroup: typeof groups.$inferSelect | undefined;
    let relatedCoverages: typeof coverages.$inferSelect[] = [];
    let relatedEmployeeClasses: typeof employeeClasses.$inferSelect[] = [];

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
      relatedEmployeeClasses = await db
        .select()
        .from(employeeClasses)
        .where(eq(employeeClasses.groupId, quote[0].groupId))
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
        applicant: relatedApplicants.length ? relatedApplicants[0] : null,
        group: relatedGroup || null,
        groupApplicants: quote[0].groupId ? relatedApplicants : [],
        employeeClasses: relatedEmployeeClasses,
        coverages: relatedCoverages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error fetching quote ${id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error },
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
    const resolvedParams = await Promise.resolve(context.params);
    id = resolvedParams.id;
    const quoteId = parseInt(id, 10);

    if (isNaN(quoteId)) {
      return NextResponse.json({ message: 'Invalid Quote ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status, type } = body;

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
    console.error(`Error updating quote ${id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error },
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
    const resolvedParams = await Promise.resolve(context.params);
    id = resolvedParams.id;
    const quoteId = parseInt(id, 10);

    if (isNaN(quoteId)) {
      return NextResponse.json({ message: 'Invalid Quote ID' }, { status: 400 });
    }

    // Get the quote first to check its type and related entities
    const quote = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, quoteId))
      .execute();

    if (!quote.length) {
      return NextResponse.json({ message: 'Quote not found' }, { status: 404 });
    }

    // Delete coverages associated with this quote
    await db.delete(coverages).where(eq(coverages.quoteId, quoteId));

    // For Individual quotes, delete the applicant
    if (quote[0].applicantId) {
      await db.delete(applicants).where(eq(applicants.id, quote[0].applicantId));
    }

    // For Group quotes, delete employees, classes, and the group
    if (quote[0].groupId) {
      const groupId = quote[0].groupId;

      // Delete all applicants (employees) in this group
      await db.delete(applicants).where(eq(applicants.groupId, groupId));

      // Delete all employee classes in this group
      await db.delete(employeeClasses).where(eq(employeeClasses.groupId, groupId));

      // Delete the group
      await db.delete(groups).where(eq(groups.id, groupId));
    }

    // Delete the quote itself
    const deleted = await db
      .delete(quotes)
      .where(eq(quotes.id, quoteId))
      .returning();

    if (!deleted.length) {
      return NextResponse.json({ message: 'Failed to delete quote' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Quote deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting quote ${id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
