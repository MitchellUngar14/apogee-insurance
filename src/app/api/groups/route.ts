// src/app/api/groups/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groups, quotes } from '@/lib/schema';

export async function GET() {
  try {
    const allGroups = await db.select().from(groups);
    return NextResponse.json(allGroups, { status: 200 });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { groupName } = body;

    if (!groupName) {
      return NextResponse.json({ message: 'Group name is required' }, { status: 400 });
    }

    const newGroup = await db.insert(groups).values({ groupName }).returning();

    if (!newGroup[0]) {
      throw new Error('Failed to create group');
    }

    // Create a new quote associated with this group
    const newQuote = await db
      .insert(quotes)
      .values({
        groupId: newGroup[0].id,
        type: 'Group', // Always Group for this endpoint
        status: 'In Progress',
      })
      .returning();

    return NextResponse.json(
      { group: newGroup[0], quote: newQuote[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating group or quote:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
