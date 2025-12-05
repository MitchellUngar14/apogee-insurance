// src/components/EditApplicantForm.tsx
'use client';

import React, { useState } from 'react';

// Helper function to format date consistently for display (YYYY-MM-DD)
const formatDateForDisplay = (dateInput: string | Date): string => {
  const date = new Date(dateInput);
  // Get UTC components to avoid local timezone offset
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface Applicant {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthdate: string; // YYYY-MM-DD format for input type="date"
  phoneNumber?: string;
  email: string;
  groupId: number | null;
  quoteType: 'Individual' | 'Group' | null;
  status: 'Incomplete' | 'Complete';
  createdAt: string;
}

interface EditApplicantFormProps {
  applicant: Applicant;
  onSave: (data: Partial<Applicant>) => void;
  onCancel: () => void;
}

export default function EditApplicantForm({ applicant, onSave, onCancel }: EditApplicantFormProps) {
  // Initialize birthdate in YYYY-MM-DD format for the input type="date"
  const initialBirthdate = applicant.birthdate ? formatDateForDisplay(applicant.birthdate) : '';
  const [formData, setFormData] = useState<Partial<Applicant>>({
    ...applicant,
    birthdate: initialBirthdate,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[var(--background)] white-shadow rounded-lg p-6 my-8">
      <h2 className="text-2xl font-bold mb-6 form-label">Edit Applicant (ID: {applicant.id})</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium form-label">
            First Name:
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            value={formData.firstName || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md shadow-sm p-2"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>
        <div>
          <label htmlFor="middleName" className="block text-sm font-medium form-label">
            Middle Name:
          </label>
          <input
            type="text"
            name="middleName"
            id="middleName"
            value={formData.middleName || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md shadow-sm p-2"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium form-label">
            Last Name:
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            value={formData.lastName || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md shadow-sm p-2"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>
        <div>
          <label htmlFor="birthdate" className="block text-sm font-medium form-label">
            Birthdate:
          </label>
          <input
            type="date"
            name="birthdate"
            id="birthdate"
            value={formData.birthdate || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md shadow-sm p-2"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium form-label">
            Phone Number:
          </label>
          <input
            type="tel"
            name="phoneNumber"
            id="phoneNumber"
            value={formData.phoneNumber || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md shadow-sm p-2"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium form-label">
            Email:
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md shadow-sm p-2"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium form-label">
            Status:
          </label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md shadow-sm p-2"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
          >
            <option value="Incomplete">Incomplete</option>
            <option value="Complete">Complete</option>
          </select>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-white rounded-md hover:bg-soft-green-600 transition-colors"
            style={{ backgroundColor: '#22c55e' }}
          >
            Save Applicant
          </button>
        </div>
      </form>
    </div>
  );
}
