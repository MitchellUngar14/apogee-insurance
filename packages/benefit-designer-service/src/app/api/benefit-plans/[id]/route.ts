import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { plans, productConfigurations } from '../../../../lib/schema'; // Changed benefitPlans to plans
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let id: string = 'unknown';
  try {
    const resolvedParams = await Promise.resolve(context.params);
    id = resolvedParams.id;
    const planId = parseInt(id, 10);

    if (isNaN(planId)) {
      return NextResponse.json({ message: 'Invalid Plan ID' }, { status: 400 });
    }

    const plan = await db
      .select()
      .from(plans) // Changed benefitPlans to plans
      .where(eq(plans.id, planId)) // Changed benefitPlans.id to plans.id
      .execute();

    if (!plan.length) {
      return NextResponse.json({ message: 'Benefit plan not found' }, { status: 404 });
    }

    // Fetch related product configurations
    const products = await db
      .select()
      .from(productConfigurations)
      .where(eq(productConfigurations.benefitPlanId, planId))
      .execute();

    return NextResponse.json(
      {
        benefitPlan: plan[0],
        productConfigurations: products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error fetching benefit plan ${id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let id: string = 'unknown';
  try {
    const resolvedParams = await Promise.resolve(context.params);
    id = resolvedParams.id;
    const planId = parseInt(id, 10);

    if (isNaN(planId)) {
      return NextResponse.json({ message: 'Invalid Plan ID' }, { status: 400 });
    }

    const body = await request.json();
    const { planName, status } = body;

    const updateData: Record<string, any> = {};
    if (planName !== undefined) updateData.planName = planName;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) { 
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updatedPlans = await db
      .update(plans) // Changed benefitPlans to plans
      .set(updateData)
      .where(eq(plans.id, planId)) // Changed benefitPlans.id to plans.id
      .returning();

    if (!updatedPlans.length) {
      return NextResponse.json({ message: 'Benefit plan not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json(updatedPlans[0], { status: 200 });
  } catch (error) {
    console.error(`Error updating benefit plan ${id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let id: string = 'unknown';
  try {
    const resolvedParams = await Promise.resolve(context.params);
    id = resolvedParams.id;
    const planId = parseInt(id, 10);

    if (isNaN(planId)) {
      return NextResponse.json({ message: 'Invalid Plan ID' }, { status: 400 });
    }

    // Delete associated product configurations first
    await db
      .delete(productConfigurations)
      .where(eq(productConfigurations.benefitPlanId, planId));

    // Delete the benefit plan
    const deletedPlans = await db
      .delete(plans) // Changed benefitPlans to plans
      .where(eq(plans.id, planId)) // Changed benefitPlans.id to plans.id
      .returning();

    if (!deletedPlans.length) {
      return NextResponse.json({ message: 'Benefit plan not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Benefit plan deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting benefit plan ${id}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error },
      { status: 500 }
    );
  }
}