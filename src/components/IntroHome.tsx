// src/components/IntroHome.tsx
'use client';

import React from 'react';
import ServiceCard from '@/components/ServiceCard'; // Import the new ServiceCard component

type IntroHomeProps = {
  onGoToQuotingPlatform: () => void;
  onGoToCustomerServicePlatform: () => void;
  onGoToBenefitDesignerPlatform: () => void; // New prop
};

export default function IntroHome({
  onGoToQuotingPlatform,
  onGoToCustomerServicePlatform,
  onGoToBenefitDesignerPlatform, // Destructure new prop
}: IntroHomeProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <h1 className="text-5xl font-bold mb-8 form-label">
        Welcome!
      </h1>
      <div className="flex flex-wrap justify-center gap-6"> {/* Container for multiple cards */}
        <ServiceCard
          title="Quoting"
          description="Start new insurance quotes for individuals or groups, or view existing ones."
          onClick={onGoToQuotingPlatform}
          style={{ backgroundColor: '#22c55e' }} // Explicitly green
          // icon={<FaFileContract />} // Placeholder for an icon, if desired
        />
        <ServiceCard
          title="Customer Service"
          description="Access tools for managing customer inquiries and support."
          onClick={onGoToCustomerServicePlatform} // Use the new prop here
          style={{ backgroundColor: '#0284c7' }} // Explicitly soft-blue-500
          // icon={<FaHeadset />} // Placeholder for an icon, if desired
        />
        <ServiceCard
          title="Benefit Designer"
          description="Design and configure benefit plans and packages."
          onClick={onGoToBenefitDesignerPlatform} // Use the new prop here
          style={{ backgroundColor: '#FFA500' }} // More vibrant orange
          // icon={<FaPencilRuler />} // Placeholder for an icon, if desired
        />
        {/* Future cards can be added here, e.g.:
        <ServiceCard
          title="Underwriting"
          description="Review and approve insurance policies."
          onClick={() => alert('Navigate to Underwriting')}
        />
        */}
      </div>
    </div>
  );
}
