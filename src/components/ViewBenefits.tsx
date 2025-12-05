// src/components/ViewBenefits.tsx
'use client';

import React from 'react';
import { useHeader } from '@/context/HeaderContext';

interface ViewBenefitsProps {
  onBack: () => void;
}

export default function ViewBenefits({ onBack }: ViewBenefitsProps) {
  const { setHeaderTitle, setShowHomeButton } = useHeader();

  const handleBack = () => {
    // We are staying within the Benefit Designer context, so no header/home button changes
    onBack(); // Callback to page.tsx to return to BenefitDesignerPlatform home
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <h2 className="text-3xl font-semibold mb-8 form-label" style={{ color: '#FFA500' }}>
        Existing Benefits
      </h2>
      <p className="text-lg form-label mb-6">
        Details of configured benefits will be displayed here.
      </p>

      <button
        onClick={handleBack}
        className="px-6 py-2 text-white rounded-md hover:bg-orange-600 transition-colors"
        style={{ backgroundColor: '#FFA500' }} // Vibrant orange
      >
        ← Back to Benefit Designer
      </button>

      {/* Table of benefits will go here */}
    </div>
  );
}
