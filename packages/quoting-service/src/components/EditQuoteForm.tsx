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

type EditQuoteFormProps = {
  quote: Quote;
  onSave: (updatedData: Partial<Quote>) => void;
  onCancel: () => void;
};

export default function EditQuoteForm({ quote, onSave, onCancel }: EditQuoteFormProps) {
  const [status, setStatus] = useState(quote.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ status });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[var(--background)] white-shadow rounded-lg p-6 my-8">
      <h2 className="text-2xl font-bold mb-6 form-label">Edit Quote (ID: {quote.id})</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium form-label">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Quote['status'])}
            className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
          >
            <option value="In Progress">In Progress</option>
            <option value="Ready for Sale">Ready for Sale</option>
            <option value="Archived">Archived</option>
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
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
