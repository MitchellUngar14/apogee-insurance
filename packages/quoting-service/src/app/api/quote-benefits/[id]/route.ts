import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quoteBenefits } from '@/lib/schema';
import { eq } from 'drizzle-orm';

type RouteParams = { params: Promise<{ id: string }> };

// GET single quote benefit
export async function GET(req: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const [benefit] = await db
      .select()
      .from(quoteBenefits)
      .where(eq(quoteBenefits.id, parseInt(id, 10)));

    if (!benefit) {
      return NextResponse.json({ error: 'Quote benefit not found' }, { status: 404 });
    }
    return NextResponse.json(benefit);
  } catch (error) {
    console.error('Error fetching quote benefit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote benefit' },
      { status: 500 }
    );
  }
}

// PUT update quote benefit
export async function PUT(req: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const [updated] = await db
      .update(quoteBenefits)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(quoteBenefits.id, parseInt(id, 10)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Quote benefit not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating quote benefit:', error);
    return NextResponse.json(
      { error: 'Failed to update quote benefit' },
      { status: 500 }
    );
  }
}

// DELETE quote benefit
export async function DELETE(req: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;

    const [deleted] = await db
      .delete(quoteBenefits)
      .where(eq(quoteBenefits.id, parseInt(id, 10)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Quote benefit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quote benefit:', error);
    return NextResponse.json(
      { error: 'Failed to delete quote benefit' },
      { status: 500 }
    );
  }
}
