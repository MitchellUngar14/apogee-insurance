// JWT utilities for service token verification
import type { ServiceToken, UserRole } from '../types/auth';

// Simple base64url decode without external dependencies
function base64UrlDecode(str: string): string {
  // Replace URL-safe characters
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding
  while (base64.length % 4) {
    base64 += '=';
  }
  // Decode
  if (typeof atob !== 'undefined') {
    return atob(base64);
  }
  // Node.js fallback
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Decode a JWT token without verification (for client-side use)
 * WARNING: This does not verify the signature!
 */
export function decodeServiceToken(token: string): ServiceToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return payload as ServiceToken;
  } catch {
    return null;
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: ServiceToken): boolean {
  const now = Math.floor(Date.now() / 1000);
  return token.exp < now;
}

// Note: hasRequiredRole is exported from types/auth.ts
