'use client';

import React, { useState } from 'react';

interface PolicyHolder {
  id: number;
  policyId: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  birthdate?: string;
  phoneNumber?: string;
}

interface EditPolicyHolderFormProps {
  policyHolder: PolicyHolder;
  onSave: (updatedData: Partial<PolicyHolder>) => void;
  onCancel: () => void;
}

export default function EditPolicyHolderForm({ policyHolder, onSave, onCancel }: EditPolicyHolderFormProps) {
  const [firstName, setFirstName] = useState(policyHolder.firstName);
  const [middleName, setMiddleName] = useState(policyHolder.middleName || '');
  const [lastName, setLastName] = useState(policyHolder.lastName);
  const [email, setEmail] = useState(policyHolder.email);
  const [phoneNumber, setPhoneNumber] = useState(policyHolder.phoneNumber || '');
  const [birthdate, setBirthdate] = useState(
    policyHolder.birthdate ? new Date(policyHolder.birthdate).toISOString().split('T')[0] : ''
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        firstName,
        middleName: middleName || undefined,
        lastName,
        email,
        phoneNumber: phoneNumber || undefined,
        birthdate: birthdate || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold form-label mb-4">Edit Policy Holder</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium form-label mb-1">First Name *</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full p-2 rounded-md shadow-sm form-label"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium form-label mb-1">Middle Name</label>
          <input
            type="text"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            className="w-full p-2 rounded-md shadow-sm form-label"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium form-label mb-1">Last Name *</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full p-2 rounded-md shadow-sm form-label"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium form-label mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 rounded-md shadow-sm form-label"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium form-label mb-1">Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-2 rounded-md shadow-sm form-label"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium form-label mb-1">Date of Birth</label>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="w-full p-2 rounded-md shadow-sm form-label max-w-xs"
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
