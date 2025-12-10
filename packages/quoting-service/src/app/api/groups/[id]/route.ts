import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { groups } from '../../../../lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const groupId = parseInt(resolvedParams.id, 10);

    if (isNaN(groupId)) {
      return NextResponse.json({ message: 'Invalid Group ID' }, { status: 400 });
    }

    const group = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .execute();

    if (!group.length) {
      return NextResponse.json({ message: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group[0], { status: 200 });
  } catch (error) {
    console.error('Error fetching group:', error);
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
  try {
    const resolvedParams = await context.params;
    const groupId = parseInt(resolvedParams.id, 10);

    if (isNaN(groupId)) {
      return NextResponse.json({ message: 'Invalid Group ID' }, { status: 400 });
    }

    const body = await request.json();
    const { groupName } = body;

    const updateData: Record<string, any> = {};
    if (groupName !== undefined) updateData.groupName = groupName;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updated = await db
      .update(groups)
      .set(updateData)
      .where(eq(groups.id, groupId))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ message: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
