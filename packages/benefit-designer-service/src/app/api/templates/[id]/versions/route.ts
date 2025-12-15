// packages/benefit-designer-service/src/app/api/templates/[id]/versions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { benefitTemplates, benefitCategories } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET all versions of a template by ID (uses templateId UUID from the record)
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

    // First get the template to find its templateId (UUID)
    const [template] = await db
      .select()
      .from(benefitTemplates)
      .where(eq(benefitTemplates.id, templateId));

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Get all versions with this templateId (UUID)
    const versions = await db
      .select({
        id: benefitTemplates.id,
        templateId: benefitTemplates.templateId,
        categoryId: benefitTemplates.categoryId,
        categoryName: benefitCategories.name,
        type: benefitTemplates.type,
        name: benefitTemplates.name,
        description: benefitTemplates.description,
        version: benefitTemplates.version,
        majorVersion: benefitTemplates.majorVersion,
        minorVersion: benefitTemplates.minorVersion,
        status: benefitTemplates.status,
        createdAt: benefitTemplates.createdAt,
        updatedAt: benefitTemplates.updatedAt,
      })
      .from(benefitTemplates)
      .leftJoin(benefitCategories, eq(benefitTemplates.categoryId, benefitCategories.id))
      .where(eq(benefitTemplates.templateId, template.templateId))
      .orderBy(
        desc(benefitTemplates.majorVersion),
        desc(benefitTemplates.minorVersion)
      );

    return NextResponse.json({
      templateId: template.templateId,
      name: template.name,
      versions,
    });
  } catch (error) {
    console.error('Error fetching template versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template versions' },
      { status: 500 }
    );
  }
}
