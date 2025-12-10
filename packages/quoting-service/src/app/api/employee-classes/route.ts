// Employee Classes API
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { employeeClasses } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

// GET all employee classes, optionally filtered by groupId
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');

    let query = db.select().from(employeeClasses);

    if (groupId) {
      const classes = await db
        .select()
        .from(employeeClasses)
        .where(eq(employeeClasses.groupId, parseInt(groupId, 10)));
      return NextResponse.json(classes, { status: 200 });
    }

    const allClasses = await query;
    return NextResponse.json(allClasses, { status: 200 });
  } catch (error) {
    console.error('Error fetching employee classes:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST create a new employee class
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { groupId, className, description } = body;

    if (!groupId || !className) {
      return NextResponse.json(
        { message: 'Group ID and class name are required' },
        { status: 400 }
      );
    }

    const newClass = await db
      .insert(employeeClasses)
      .values({
        groupId,
        className,
        description,
      })
      .returning();

    return NextResponse.json(newClass[0], { status: 201 });
  } catch (error) {
    console.error('Error creating employee class:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
