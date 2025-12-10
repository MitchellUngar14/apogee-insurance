import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { productConfigurations } from '../../../lib/schema';

export async function GET() {
  try {
    const allConfigs = await db.select().from(productConfigurations);
    return NextResponse.json(allConfigs, { status: 200 });
  } catch (error) {
    console.error('Error fetching product configurations:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { benefitPlanId, productType, configDetails, premiumBase, deductible, copay } = body;

    if (!benefitPlanId || !productType) {
      return NextResponse.json(
        { message: 'Benefit plan ID and product type are required' },
        { status: 400 }
      );
    }

    const newConfig = await db
      .insert(productConfigurations)
      .values({
        benefitPlanId,
        productType,
        configDetails,
        premiumBase,
        deductible,
        copay,
      })
      .returning();

    return NextResponse.json(
      { productConfiguration: newConfig[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product configuration:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
