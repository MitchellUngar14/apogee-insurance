// packages/benefit-designer-service/src/app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { benefitTemplates, benefitCategories } from '@/lib/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// GET all templates (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'group' or 'individual'
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status'); // 'draft', 'active', 'archived'
    const latestOnly = searchParams.get('latest') === 'true'; // Only get latest version of each template

    // Build query with joins
    const templates = await db
      .select({
        id: benefitTemplates.id,
        templateId: benefitTemplates.templateId,
        categoryId: benefitTemplates.categoryId,
        categoryName: benefitCategories.name,
        categoryIcon: benefitCategories.icon,
        type: benefitTemplates.type,
        name: benefitTemplates.name,
        description: benefitTemplates.description,
        version: benefitTemplates.version,
        majorVersion: benefitTemplates.majorVersion,
        minorVersion: benefitTemplates.minorVersion,
        fieldSchema: benefitTemplates.fieldSchema,
        defaultValues: benefitTemplates.defaultValues,
        status: benefitTemplates.status,
        createdAt: benefitTemplates.createdAt,
        updatedAt: benefitTemplates.updatedAt,
      })
      .from(benefitTemplates)
      .leftJoin(benefitCategories, eq(benefitTemplates.categoryId, benefitCategories.id))
      .orderBy(desc(benefitTemplates.createdAt));

    let filtered = templates;

    // Filter by type
    if (type) {
      filtered = filtered.filter(t => t.type === type);
    }

    // Filter by category
    if (categoryId) {
      const catId = parseInt(categoryId, 10);
      filtered = filtered.filter(t => t.categoryId === catId);
    }

    // Filter by status
    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }

    // If latestOnly, group by templateId and get the highest version
    if (latestOnly) {
      const latestMap = new Map<string, typeof filtered[0]>();
      for (const template of filtered) {
        const existing = latestMap.get(template.templateId);
        if (!existing ||
            template.majorVersion > existing.majorVersion ||
            (template.majorVersion === existing.majorVersion && template.minorVersion > existing.minorVersion)) {
          latestMap.set(template.templateId, template);
        }
      }
      filtered = Array.from(latestMap.values());
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      categoryId,
      type,
      name,
      description,
      fieldSchema,
      defaultValues,
      status = 'draft',
    } = body;

    // Validation
    if (!categoryId || !type || !name) {
      return NextResponse.json(
        { error: 'categoryId, type, and name are required' },
        { status: 400 }
      );
    }

    if (!['group', 'individual'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be either "group" or "individual"' },
        { status: 400 }
      );
    }

    // Verify category exists and supports this type
    const [category] = await db
      .select()
      .from(benefitCategories)
      .where(eq(benefitCategories.id, categoryId));

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const appliesTo = category.appliesTo as string[];
    if (!appliesTo.includes(type)) {
      return NextResponse.json(
        { error: `Category "${category.name}" does not support ${type} benefits` },
        { status: 400 }
      );
    }

    // Generate new template UUID
    const templateId = randomUUID();

    const [newTemplate] = await db
      .insert(benefitTemplates)
      .values({
        templateId,
        categoryId,
        type,
        name,
        description: description || null,
        version: '1.0',
        majorVersion: 1,
        minorVersion: 0,
        fieldSchema: fieldSchema || { fields: [] },
        defaultValues: defaultValues || {},
        status,
      })
      .returning();

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
