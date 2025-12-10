// Auth types shared across all services

export type UserRole = 'Quoting' | 'CustomerService' | 'BenefitDesigner' | 'Admin';

export interface ServiceToken {
  userId: number;
  email: string;
  roles: UserRole[];
  exp: number;
  iat: number;
}

export interface AuthUser {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  roles: UserRole[];
}

// Maps service names to the roles that can access them
export const SERVICE_ROLE_MAP: Record<string, UserRole[]> = {
  'quoting': ['Quoting', 'Admin'],
  'customer-service': ['CustomerService', 'Admin'],
  'benefit-designer': ['BenefitDesigner', 'Admin'],
};

// Service URLs for redirects
export const SERVICE_URLS: Record<string, string> = {
  'quoting': process.env.NEXT_PUBLIC_QUOTING_URL || 'https://apogee-insurance-quoting.vercel.app',
  'customer-service': process.env.NEXT_PUBLIC_CUSTOMER_SERVICE_URL || 'https://apogee-insurance-customer-service.vercel.app',
  'benefit-designer': process.env.NEXT_PUBLIC_BENEFIT_DESIGNER_URL || 'https://apogee-insurance-benefit-designer.vercel.app',
};

// Check if a user has access to a service
export function hasServiceAccess(userRoles: UserRole[], serviceName: string): boolean {
  const requiredRoles = SERVICE_ROLE_MAP[serviceName];
  if (!requiredRoles) return false;
  return userRoles.some(role => requiredRoles.includes(role));
}

// Check if user has any of the required roles
export function hasRequiredRole(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  return userRoles.some(role => requiredRoles.includes(role));
}
