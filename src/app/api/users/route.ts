// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/auth';
import { users, userRoles } from '@/lib/schema/auth';
import { eq } from 'drizzle-orm';

// POST - Create a new user (for seeding/admin purposes)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, roles } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
      })
      .returning();

    // Add roles if provided
    if (roles && Array.isArray(roles) && roles.length > 0) {
      const validRoles = ['Quoting', 'CustomerService', 'BenefitDesigner', 'Admin'];
      const rolesToInsert = roles
        .filter((role: string) => validRoles.includes(role))
        .map((role: string) => ({
          userId: newUser.id,
          role: role as 'Quoting' | 'CustomerService' | 'BenefitDesigner' | 'Admin',
        }));

      if (rolesToInsert.length > 0) {
        await db.insert(userRoles).values(rolesToInsert);
      }
    }

    return NextResponse.json({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      roles: roles || [],
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// GET - List all users (for admin purposes)
export async function GET() {
  try {
    const allUsers = await db.query.users.findMany({
      with: {
        roles: true,
      },
    });

    return NextResponse.json(
      allUsers.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        roles: user.roles.map((r) => r.role),
        createdAt: user.createdAt,
      }))
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
