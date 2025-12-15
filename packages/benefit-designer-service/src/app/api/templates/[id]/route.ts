// packages/benefit-designer-service/src/app/api/templates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { benefitTemplates, benefitCategories } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET single template by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const templateId = parseInt(id, 10);

    if (isNaN(templateId)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const [template] = await db
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
      .where(eq(benefitTemplates.id, templateId));

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT update template - creates a new version
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const templateId = parseInt(id, 10);

    if (isNaN(templateId)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      fieldSchema,
      defaultValues,
      status,
      versionBump = 'minor', // 'minor' or 'major'
    } = body;

    // Get existing template
    const [existing] = await db
      .select()
      .from(benefitTemplates)
      .where(eq(benefitTemplates.id, templateId));

    if (!existing) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // If template is still in draft, update in place
    if (existing.status === 'draft') {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (fieldSchema !== undefined) updateData.fieldSchema = fieldSchema;
      if (defaultValues !== undefined) updateData.defaultValues = defaultValues;
      if (status !== undefined) updateData.status = status;

      const [updated] = await db
        .update(benefitTemplates)
        .set(updateData)
        .where(eq(benefitTemplates.id, templateId))
        .returning();

      return NextResponse.json(updated);
    }

    // If template is active/archived, create a new version
    let newMajor = existing.majorVersion;
    let newMinor = existing.minorVersion;

    if (versionBump === 'major') {
      newMajor += 1;
      newMinor = 0;
    } else {
      newMinor += 1;
    }

    const newVersion = `${newMajor}.${newMinor}`;

    // Archive the old version if it was active
    if (existing.status === 'active') {
      await db
        .update(benefitTemplates)
        .set({
          status: 'archived',
          updatedAt: new Date(),
        })
        .where(eq(benefitTemplates.id, templateId));
    }

    // Create new version
    const [newTemplate] = await db
      .insert(benefitTemplates)
      .values({
        templateId: existing.templateId, // Same UUID to link versions
        categoryId: existing.categoryId,
        type: existing.type,
        name: name ?? existing.name,
        description: description ?? existing.description,
        version: newVersion,
        majorVersion: newMajor,
        minorVersion: newMinor,
        fieldSchema: fieldSchema ?? existing.fieldSchema,
        defaultValues: defaultValues ?? existing.defaultValues,
        status: status ?? 'draft',
      })
      .returning();

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// PATCH - update status only (for publishing or archiving)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const templateId = parseInt(id, 10);

    if (isNaN(templateId)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['draft', 'active', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (draft, active, archived) is required' },
        { status: 400 }
      );
    }

    // Get existing template
    const [existing] = await db
      .select()
      .from(benefitTemplates)
      .where(eq(benefitTemplates.id, templateId));

    if (!existing) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // If setting to active, archive any other active versions of this template
    if (status === 'active') {
      await db
        .update(benefitTemplates)
        .set({
          status: 'archived',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(benefitTemplates.templateId, existing.templateId),
            eq(benefitTemplates.status, 'active')
          )
        );
    }

    // Update the status
    const [updated] = await db
      .update(benefitTemplates)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(benefitTemplates.id, templateId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating template status:', error);
    return NextResponse.json(
      { error: 'Failed to update template status' },
      { status: 500 }
    );
  }
}
