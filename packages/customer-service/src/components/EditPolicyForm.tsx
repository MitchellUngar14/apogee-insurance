'use client';

import React, { useState } from 'react';

interface Policy {
  id: number;
  policyNumber: string;
  type: 'Individual' | 'Group';
  status: 'Active' | 'Cancelled' | 'Expired';
  effectiveDate: string;
  expirationDate: string | null;
}

interface EditPolicyFormProps {
  policy: Policy;
  onSave: (updatedData: { effectiveDate: string; expirationDate: string | null }) => void;
  onCancel: () => void;
}

export default function EditPolicyForm({ policy, onSave, onCancel }: EditPolicyFormProps) {
  const [effectiveDate, setEffectiveDate] = useState(
    policy.effectiveDate ? new Date(policy.effectiveDate).toISOString().split('T')[0] : ''
  );
  const [expirationDate, setExpirationDate] = useState(
    policy.expirationDate ? new Date(policy.expirationDate).toISOString().split('T')[0] : ''
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        effectiveDate,
        expirationDate: expirationDate || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold form-label mb-4">Edit Policy Information</h3>

      <div>
        <label className="block text-sm font-medium form-label mb-1">Policy Number</label>
        <input
          type="text"
          value={policy.policyNumber}
          disabled
          className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 form-label cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm font-medium form-label mb-1">Type</label>
        <input
          type="text"
          value={policy.type}
          disabled
          className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 form-label cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm font-medium form-label mb-1">Effective Date *</label>
        <input
          type="date"
          value={effectiveDate}
          onChange={(e) => setEffectiveDate(e.target.value)}
          required
          className="w-full p-2 rounded-md shadow-sm form-label"
          style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium form-label mb-1">Expiration Date</label>
        <input
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          className="w-full p-2 rounded-md shadow-sm form-label"
          style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
