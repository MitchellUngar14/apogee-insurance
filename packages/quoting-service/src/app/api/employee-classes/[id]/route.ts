// Employee Class Detail API
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { employeeClasses, applicants } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET single employee class with its members
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const classId = parseInt(resolvedParams.id, 10);

    if (isNaN(classId)) {
      return NextResponse.json({ message: 'Invalid Class ID' }, { status: 400 });
    }

    const employeeClass = await db
      .select()
      .from(employeeClasses)
      .where(eq(employeeClasses.id, classId))
      .execute();

    if (!employeeClass.length) {
      return NextResponse.json({ message: 'Employee class not found' }, { status: 404 });
    }

    // Get members in this class
    const members = await db
      .select()
      .from(applicants)
      .where(eq(applicants.classId, classId))
      .execute();

    return NextResponse.json(
      {
        ...employeeClass[0],
        members,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching employee class:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH update employee class
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const classId = parseInt(resolvedParams.id, 10);

    if (isNaN(classId)) {
      return NextResponse.json({ message: 'Invalid Class ID' }, { status: 400 });
    }

    const body = await request.json();
    const { className, description } = body;

    const updateData: Record<string, any> = {};
    if (className !== undefined) updateData.className = className;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updated = await db
      .update(employeeClasses)
      .set(updateData)
      .where(eq(employeeClasses.id, classId))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ message: 'Employee class not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('Error updating employee class:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE employee class
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const classId = parseInt(resolvedParams.id, 10);

    if (isNaN(classId)) {
      return NextResponse.json({ message: 'Invalid Class ID' }, { status: 400 });
    }

    // Check if there are employees in this class
    const members = await db
      .select()
      .from(applicants)
      .where(eq(applicants.classId, classId))
      .execute();

    if (members.length > 0) {
      return NextResponse.json(
        { message: 'Cannot delete class with assigned employees. Remove employees first.' },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(employeeClasses)
      .where(eq(employeeClasses.id, classId))
      .returning();

    if (!deleted.length) {
      return NextResponse.json({ message: 'Employee class not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Employee class deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting employee class:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
