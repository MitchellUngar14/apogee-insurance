// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SERVICE_NAME = 'quoting';
const ALLOWED_ROLES = ['Quoting', 'Admin'];
const PORTAL_URL = process.env.PORTAL_URL;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for static files and API health checks
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/health') ||
    pathname === '/favicon.ico' ||
    pathname === '/unauthorized'
  ) {
    return NextResponse.next();
  }

  // Allow internal service-to-service communication via service key
  const serviceKey = request.headers.get('X-Service-Key');
  const internalServiceKey = process.env.INTERNAL_SERVICE_KEY;
  if (internalServiceKey && serviceKey === internalServiceKey && pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get token from query param, cookie, or Authorization header
  const tokenFromQuery = request.nextUrl.searchParams.get('token');
  const tokenFromCookie = request.cookies.get('service_token')?.value;
  const tokenFromHeader = request.headers.get('Authorization')?.replace('Bearer ', '');

  const token = tokenFromQuery || tokenFromCookie || tokenFromHeader;

  if (!token) {
    // No token - redirect to portal
    return NextResponse.redirect(new URL('/auth/signin', PORTAL_URL));
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not configured');
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  try {
    // Verify the token
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);

    // Check if user has required role
    const userRoles = (payload.roles as string[]) || [];
    const hasAccess = userRoles.some(role => ALLOWED_ROLES.includes(role));

    if (!hasAccess) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // If token came from query param, store in cookie and redirect to clean URL
    if (tokenFromQuery) {
      const response = NextResponse.redirect(new URL(pathname, request.url));
      response.cookies.set('service_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/',
      });
      return response;
    }

    // Add user info to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', String(payload.userId));
    requestHeaders.set('x-user-email', String(payload.email));
    requestHeaders.set('x-user-roles', userRoles.join(','));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    // Clear invalid cookie and redirect to portal
    const response = NextResponse.redirect(new URL('/auth/signin', PORTAL_URL));
    response.cookies.delete('service_token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
