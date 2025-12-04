// src/app/api/groups/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groups } from '@/lib/schema';

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
