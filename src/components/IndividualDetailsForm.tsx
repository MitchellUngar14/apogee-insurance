// src/components/IndividualDetailsForm.tsx
'use client';

import React, { useState, useEffect } from 'react';

type IndividualDetailsFormProps = {
  initialData?: {
    firstName: string;
    middleName?: string;
    lastName: string;
    birthdate: string; // Will be YYYY-MM-DD for input type="date"
    phoneNumber?: string;
    email: string;
  };
  onNext?: (data: any) => void; // Made optional
  onPrevious?: () => void; // Made optional
  isFirstStep?: boolean; // Made optional
  isLastStep?: boolean; // Made optional
};

export default function IndividualDetailsForm({
  initialData,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
}: IndividualDetailsFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    middleName: initialData?.middleName || '',
    lastName: initialData?.lastName || '',
    birthdate: initialData?.birthdate || '',
    phoneNumber: initialData?.phoneNumber || '',
    email: initialData?.email || '',
  });

  useEffect(() => {
    setFormData({
      firstName: initialData?.firstName || '',
      middleName: initialData?.middleName || '',
      lastName: initialData?.lastName || '',
      birthdate: initialData?.birthdate || '',
      phoneNumber: initialData?.phoneNumber || '',
      email: initialData?.email || '',
    });
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.birthdate || !formData.email) {
      alert('Please fill in all required fields (First Name, Last Name, Birthdate, Email).');
      return;
    }
    // TODO: Add more robust validation, e.g., email format, date format, phone format
    onNext?.(formData); // Use optional chaining
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium form-label">
          First Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="firstName"
          id="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label htmlFor="middleName" className="block text-sm font-medium form-label">
          Middle Name (Optional)
        </label>
        <input
          type="text"
          name="middleName"
          id="middleName"
          value={formData.middleName}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium form-label">
          Last Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="lastName"
          id="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label htmlFor="birthdate" className="block text-sm font-medium form-label">
          Birthdate <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="birthdate"
          id="birthdate"
          value={formData.birthdate}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium form-label">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          name="phoneNumber"
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium form-label">
          Email <span className="text-red-500">*</span>
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
