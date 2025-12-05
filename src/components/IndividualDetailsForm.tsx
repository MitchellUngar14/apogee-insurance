// src/components/IndividualDetailsForm.tsx
'use client';

import React, { useState, useEffect } from 'react';

type IndividualDetailsFormProps = {
  initialData?: {
    fullName: string;
    email: string;
    // Add more fields as needed, e.g., phone, address
  };
  onNext: (data: any) => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
};

export default function IndividualDetailsForm({
  initialData,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
}: IndividualDetailsFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
  });

  useEffect(() => {
    // Update form data if initialData changes (e.g., when navigating back and forth)
    setFormData({
      fullName: initialData?.fullName || '',
      email: initialData?.email || '',
    });
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add validation here
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium form-label">
          Full Name
        </label>
        <input
          type="text"
          name="fullName"
          id="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium form-label">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md shadow-sm p-2"
        />
      </div>
      {/* Add more form fields here */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="px-6 py-2 text-white rounded-md hover:bg-soft-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                     dark:bg-soft-green-800 dark:text-soft-green-100 dark:hover:bg-soft-green-700"
          style={{ backgroundColor: '#22c55e' }}
        >
          Previous
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-white rounded-md hover:bg-soft-green-600 transition-colors"
          style={{ backgroundColor: '#22c55e' }}
        >
          {isLastStep ? 'Finish' : 'Next'}
        </button>
      </div>
    </form>
  );
}
