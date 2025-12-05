// src/components/EditQuoteForm.tsx
'use client';

import React, { useState } from 'react';

interface Quote {
  id: number;
  status: 'In Progress' | 'Ready for Sale' | 'Archived';
  type: 'Individual' | 'Group';
  applicantId: number | null;
  groupId: number | null;
  createdAt: string;
}

interface EditQuoteFormProps {
  quote: Quote;
  onSave: (data: Partial<Quote>) => void;
  onCancel: () => void;
}

export default function EditQuoteForm({ quote, onSave, onCancel }: EditQuoteFormProps) {
  const [formData, setFormData] = useState<Partial<Quote>>(quote);

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
      <h2 className="text-2xl font-bold mb-6 form-label">Edit Quote (ID: {quote.id})</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            <option value="In Progress">In Progress</option>
            <option value="Ready for Sale">Ready for Sale</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* Add more editable quote fields here if needed */}

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
            Save Quote
          </button>
        </div>
      </form>
    </div>
  );
}
