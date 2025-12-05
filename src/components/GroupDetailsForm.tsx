// src/components/GroupDetailsForm.tsx
'use client';

import React, { useState, useEffect } from 'react';

type GroupDetailsFormProps = {
  initialData?: {
    groupName: string;
    // Add more fields as needed for group details
  };
  onNext: (data: any) => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
};

export default function GroupDetailsForm({
  initialData,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
}: GroupDetailsFormProps) {
  const [formData, setFormData] = useState({
    groupName: initialData?.groupName || '',
  });

  useEffect(() => {
    setFormData({
      groupName: initialData?.groupName || '',
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
        <label htmlFor="groupName" className="block text-sm font-medium form-label">
          Group Name (Company Name)
        </label>
        <input
          type="text"
          name="groupName"
          id="groupName"
          value={formData.groupName}
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
                     dark:bg-soft-blue-800 dark:text-soft-blue-100 dark:hover:bg-soft-blue-700"
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
