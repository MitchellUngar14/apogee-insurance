// src/app/api/auth/service-token/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { SignJWT } from 'jose';

// Generate a service token for cross-domain authentication
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { service } = body;

    if (!service) {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create a short-lived token (15 minutes)
    const secret = new TextEncoder().encode(jwtSecret);
    const token = await new SignJWT({
      userId: parseInt(session.user.id),
      email: session.user.email,
      roles: session.user.roles,
      service,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(secret);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating service token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
