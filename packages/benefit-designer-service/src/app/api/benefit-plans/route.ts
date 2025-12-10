import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { benefitPlans, productConfigurations } from '@/lib/schema';

export async function GET() {
  try {
    const allPlans = await db.select().from(benefitPlans);
    return NextResponse.json(allPlans, { status: 200 });
  } catch (error) {
    console.error('Error fetching benefit plans:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planName, planType, description, products } = body;

    if (!planName || !planType) {
      return NextResponse.json(
        { message: 'Plan name and type are required' },
        { status: 400 }
      );
    }

    // Create the benefit plan
    const newPlan = await db
      .insert(benefitPlans)
      .values({
        planName,
        planType,
        description,
        status: 'Draft',
      })
      .returning();

    if (!newPlan[0]) {
      throw new Error('Failed to create benefit plan');
    }

    const planId = newPlan[0].id;

    // Create product configurations if provided
    if (products && Array.isArray(products) && products.length > 0) {
      await db.insert(productConfigurations).values(
        products.map((product: any) => ({
          benefitPlanId: planId,
          productType: product.productType,
          configDetails: product.configDetails,
          premiumBase: product.premiumBase,
          deductible: product.deductible,
          copay: product.copay,
        }))
      );
    }

    return NextResponse.json(
      { benefitPlan: newPlan[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating benefit plan:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
