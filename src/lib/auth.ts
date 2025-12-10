// src/lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/auth';
import { users, userRoles } from '@/lib/schema/auth';
import { eq } from 'drizzle-orm';

export type UserRole = 'Quoting' | 'CustomerService' | 'BenefitDesigner' | 'Admin';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    roles: UserRole[];
  }
  interface Session {
    user: User;
  }
}

// Extend JWT type
interface ExtendedJWT {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  roles: UserRole[];
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
          with: {
            roles: true,
          },
        });

        if (!user || !user.isActive) {
          return null;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
          return null;
        }

        // Extract roles
        const userRolesList = user.roles.map((r) => r.role as UserRole);

        return {
          id: user.id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: userRolesList,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email as string;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
        (session.user as any).roles = (token.roles as UserRole[]) || [];
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});
