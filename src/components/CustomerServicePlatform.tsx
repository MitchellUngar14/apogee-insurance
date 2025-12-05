// src/components/CustomerServicePlatform.tsx
'use client';

import React from 'react';
import { useHeader } from '@/context/HeaderContext';

type CustomerServicePlatformProps = {
  onBack: () => void;
};

export default function CustomerServicePlatform({ onBack }: CustomerServicePlatformProps) {
  const { setHeaderTitle, setShowHomeButton } = useHeader();

  const handleBackToHome = () => {
    // Reset header and hide home button when going back to intro
    setHeaderTitle("Apogee Insurance");
    setShowHomeButton(false);
    onBack(); // Callback to page.tsx to switch to IntroHome
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <h2 className="text-3xl font-semibold mb-8 form-label" style={{ color: '#0284c7' }}>
        Welcome to the Customer Service
      </h2>
      <p className="text-lg form-label mb-6">
        Here you can manage customer inquiries and support.
      </p>

      <button
        onClick={handleBackToHome}
        className="px-6 py-2 text-white rounded-md hover:bg-soft-blue-600 transition-colors"
        style={{ backgroundColor: '#0284c7' }} // soft-blue-500
      >
        ← Back to Home
      </button>

      {/* Future customer service features will go here */}
    </div>
  );
}
