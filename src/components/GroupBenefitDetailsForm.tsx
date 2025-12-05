// src/components/GroupBenefitDetailsForm.tsx
'use client';

import React from 'react';

type GroupBenefitDetailsFormProps = {
  onNext: (data: any) => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  initialData?: any;
};

export default function GroupBenefitDetailsForm({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  initialData,
}: GroupBenefitDetailsFormProps) {
  // Placeholder for form state and handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ /* form data */ });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="form-label">
        This is a placeholder form for creating group benefits.
        It will contain fields for benefit name, description, etc.
      </p>
      {/* Actual form fields would go here */}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="px-6 py-2 text-white rounded-md hover:bg-orange-600 transition-colors"
          style={{ backgroundColor: '#FFA500' }} // Vibrant orange
        >
          Previous
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-white rounded-md hover:bg-orange-600 transition-colors"
          style={{ backgroundColor: '#FFA500' }} // Vibrant orange
        >
          {isLastStep ? 'Complete' : 'Next'}
        </button>
      </div>
    </form>
  );
}
