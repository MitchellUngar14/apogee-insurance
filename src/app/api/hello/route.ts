// src/app/api/hello/route.ts
import { NextResponse } from 'next/server';
import { getHealthCheck as getBenefitDesignerHealthCheck } from '../../../../packages/benefit-designer-service/src/lib/db';
import { getHealthCheck as getCustomerServiceHealthCheck } from '../../../../packages/customer-service/src/lib/db';
import { getHealthCheck as getQuotingServiceHealthCheck } from '../../../../packages/quoting-service/src/lib/db';

export async function GET() {
  const benefitDesignerDbStatus = await getBenefitDesignerHealthCheck();
  const customerServiceDbStatus = await getCustomerServiceHealthCheck();
  const quotingServiceDbStatus = await getQuotingServiceHealthCheck();

  return NextResponse.json({
    message: 'Hello from Apogee Insurance API!',
    database: {
      benefitDesigner: benefitDesignerDbStatus,
      customerService: customerServiceDbStatus,
      quotingService: quotingServiceDbStatus,
    },
  });
}
