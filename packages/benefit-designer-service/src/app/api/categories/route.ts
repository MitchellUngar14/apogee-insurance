// packages/benefit-designer-service/src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { benefitCategories } from '@/lib/schema';
import { eq, asc } from 'drizzle-orm';

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';
    const type = searchParams.get('type'); // 'group' or 'individual'

    let query = db
      .select()
      .from(benefitCategories)
      .orderBy(asc(benefitCategories.displayOrder), asc(benefitCategories.name));

    const categories = await query;

    // Filter by active status
    let filtered = activeOnly
      ? categories.filter(c => c.isActive)
      : categories;

    // Filter by type if specified
    if (type) {
      filtered = filtered.filter(c => {
        const appliesTo = c.appliesTo as string[];
        return appliesTo.includes(type);
      });
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, appliesTo, displayOrder } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const [newCategory] = await db
      .insert(benefitCategories)
      .values({
        name,
        description: description || null,
        icon: icon || null,
        appliesTo: appliesTo || ['group', 'individual'],
        displayOrder: displayOrder || 0,
        isActive: true,
      })
      .returning();

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);

    // Check for unique constraint violation
    if ((error as any)?.code === '23505') {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
