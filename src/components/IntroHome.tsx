// src/components/IntroHome.tsx
'use client';

import React, { useState } from 'react';
import ServiceCard from '@/components/ServiceCard';

type UserRole = 'Quoting' | 'CustomerService' | 'BenefitDesigner' | 'Admin';

type IntroHomeProps = {
  userRoles?: UserRole[];
};

const SERVICE_CONFIG = [
  {
    id: 'quoting',
    title: 'Quoting',
    description: 'Start new insurance quotes for individuals or groups, or view existing ones.',
    url: process.env.NEXT_PUBLIC_QUOTING_URL,
    backgroundColor: '#22c55e',
    allowedRoles: ['Quoting', 'Admin'] as UserRole[],
  },
  {
    id: 'customer-service',
    title: 'Customer Service',
    description: 'Access tools for managing customer inquiries and support.',
    url: process.env.NEXT_PUBLIC_CUSTOMER_SERVICE_URL,
    backgroundColor: '#0284c7',
    allowedRoles: ['CustomerService', 'Admin'] as UserRole[],
  },
  {
    id: 'benefit-designer',
    title: 'Benefit Designer',
    description: 'Design and configure benefit plans and packages.',
    url: process.env.NEXT_PUBLIC_BENEFIT_DESIGNER_URL,
    backgroundColor: '#FFA500',
    allowedRoles: ['BenefitDesigner', 'Admin'] as UserRole[],
  },
];

export default function IntroHome({ userRoles = [] }: IntroHomeProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const hasAccess = (allowedRoles: UserRole[]) => {
    return userRoles.some(role => allowedRoles.includes(role));
  };

  const handleServiceClick = async (serviceId: string, serviceUrl: string) => {
    setIsLoading(serviceId);
    try {
      // Generate a service token
      const response = await fetch('/api/auth/service-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service: serviceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate service token');
      }

      const { token } = await response.json();

      // Redirect to the service with the token
      window.location.href = `${serviceUrl}?token=${token}`;
    } catch (error) {
      console.error('Error navigating to service:', error);
      alert('Failed to navigate to service. Please try again.');
      setIsLoading(null);
    }
  };

  // Filter services based on user roles
  const accessibleServices = SERVICE_CONFIG.filter(service => hasAccess(service.allowedRoles));

  if (accessibleServices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <h1 className="text-5xl font-bold mb-8 form-label">Welcome!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          You do not have access to any services. Please contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <h1 className="text-5xl font-bold mb-8 form-label">Welcome!</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Select a service to continue
      </p>
      <div className="flex flex-wrap justify-center gap-6">
        {accessibleServices.map((service) => (
          <ServiceCard
            key={service.id}
            title={service.title}
            description={service.description}
            onClick={() => handleServiceClick(service.id, service.url)}
            style={{ backgroundColor: service.backgroundColor }}
          />
        ))}
      </div>
      {isLoading && (
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Redirecting to {SERVICE_CONFIG.find(s => s.id === isLoading)?.title}...
        </p>
      )}
    </div>
  );
}
