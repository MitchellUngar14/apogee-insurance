// src/app/api/hello/route.ts
import { NextResponse } from 'next/server';
import { getHealthCheck } from '@/lib/db';

export async function GET() {
  const dbStatus = await getHealthCheck();
  return NextResponse.json({
    message: 'Hello from Apogee Insurance API!',
    database: dbStatus,
  });
}
