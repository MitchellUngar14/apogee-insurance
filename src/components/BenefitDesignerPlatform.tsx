// src/components/BenefitDesignerPlatform.tsx
'use client';

import React from 'react';
import { useHeader } from '@/context/HeaderContext';

type BenefitDesignerPlatformProps = {
  onBack: () => void;
  onCreateGroupBenefit: () => void;
  onCreateIndividualBenefit: () => void;
  onViewExistingBenefits: () => void;
};

export default function BenefitDesignerPlatform({
  onBack,
  onCreateGroupBenefit,
  onCreateIndividualBenefit,
  onViewExistingBenefits,
}: BenefitDesignerPlatformProps) {
  const { setHeaderTitle, setShowHomeButton } = useHeader();

  const handleBackToHome = () => {
    // Reset header and hide home button when going back to intro
    setHeaderTitle("Apogee Insurance");
    setShowHomeButton(false);
    onBack(); // Callback to page.tsx to switch to IntroHome
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <h2 className="text-3xl font-semibold mb-8 form-label" style={{ color: '#FFA500' }}>
        Welcome to the Benefit Designer
      </h2>
      <p className="text-lg form-label mb-6">
        Here you can design and configure benefit plans.
      </p>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={onCreateGroupBenefit}
          className="px-6 py-3 text-white rounded-md hover:bg-orange-600 transition-colors"
          style={{ backgroundColor: '#FFA500' }} // Vibrant orange
        >
          Create Group Benefit
        </button>
        <button
          onClick={onCreateIndividualBenefit}
          className="px-6 py-3 text-white rounded-md hover:bg-orange-600 transition-colors"
          style={{ backgroundColor: '#FFA500' }} // Vibrant orange
        >
          Create Individual Benefit
        </button>
      </div>

      <button
        onClick={onViewExistingBenefits}
        className="px-6 py-3 text-white rounded-md hover:bg-orange-600 transition-colors mb-6"
        style={{ backgroundColor: '#FFA500' }} // Vibrant orange
      >
        View Existing Benefits
      </button>

      <button
        onClick={handleBackToHome}
        className="px-6 py-2 text-white rounded-md hover:bg-orange-600 transition-colors"
        style={{ backgroundColor: '#FFA500' }} // Vibrant orange
      >
        ← Back to Home
      </button>

      {/* Future benefit designer features will go here */}
    </div>
  );
}
