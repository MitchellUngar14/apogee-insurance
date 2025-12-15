// packages/benefit-designer-service/src/app/api/seed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { benefitCategories } from '@/lib/schema';

const SEED_CATEGORIES = [
  {
    name: 'Extended Health',
    description: 'Extended health care coverage including prescription drugs, paramedical services, and more',
    icon: '🏥',
    appliesTo: ['group'],
    displayOrder: 1,
  },
  {
    name: 'Dental',
    description: 'Dental care coverage including preventive, basic, and major services',
    icon: '🦷',
    appliesTo: ['group'],
    displayOrder: 2,
  },
  {
    name: 'Vision',
    description: 'Vision care coverage including eye exams, glasses, and contact lenses',
    icon: '👓',
    appliesTo: ['group'],
    displayOrder: 3,
  },
  {
    name: 'Life Insurance',
    description: 'Life insurance and accidental death coverage',
    icon: '🛡️',
    appliesTo: ['group', 'individual'],
    displayOrder: 4,
  },
  {
    name: 'Disability',
    description: 'Short-term and long-term disability coverage',
    icon: '🩼',
    appliesTo: ['group'],
    displayOrder: 5,
  },
  {
    name: 'Auto Insurance',
    description: 'Vehicle insurance coverage including liability, collision, and comprehensive',
    icon: '🚗',
    appliesTo: ['individual'],
    displayOrder: 6,
  },
  {
    name: 'Home Insurance',
    description: 'Property insurance for homes including dwelling, contents, and liability',
    icon: '🏠',
    appliesTo: ['individual'],
    displayOrder: 7,
  },
  {
    name: 'Boat Insurance',
    description: 'Marine insurance for boats and watercraft',
    icon: '🚤',
    appliesTo: ['individual'],
    displayOrder: 8,
  },
  {
    name: 'Travel Insurance',
    description: 'Travel medical and trip cancellation coverage',
    icon: '✈️',
    appliesTo: ['group', 'individual'],
    displayOrder: 9,
  },
  {
    name: 'Critical Illness',
    description: 'Lump sum payment upon diagnosis of covered critical illness',
    icon: '❤️‍🩹',
    appliesTo: ['group', 'individual'],
    displayOrder: 10,
  },
];

// POST - seed the database with initial categories
export async function POST(request: NextRequest) {
  try {
    // Check if we're in development or if force flag is set
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    if (process.env.NODE_ENV === 'production' && !force) {
      return NextResponse.json(
        { error: 'Seeding is disabled in production. Use ?force=true to override.' },
        { status: 403 }
      );
    }

    const results = [];

    for (const category of SEED_CATEGORIES) {
      try {
        const [inserted] = await db
          .insert(benefitCategories)
          .values({
            name: category.name,
            description: category.description,
            icon: category.icon,
            appliesTo: category.appliesTo,
            displayOrder: category.displayOrder,
            isActive: true,
          })
          .onConflictDoNothing({ target: benefitCategories.name })
          .returning();

        if (inserted) {
          results.push({ name: category.name, status: 'created' });
        } else {
          results.push({ name: category.name, status: 'already exists' });
        }
      } catch (err) {
        results.push({ name: category.name, status: 'error', error: (err as Error).message });
      }
    }

    return NextResponse.json({
      message: 'Seed completed',
      results,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}

// GET - check current categories
export async function GET() {
  try {
    const categories = await db
      .select()
      .from(benefitCategories);

    return NextResponse.json({
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
