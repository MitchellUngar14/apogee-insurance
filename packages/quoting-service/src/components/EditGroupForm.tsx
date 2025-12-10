'use client';

import React, { useState } from 'react';

interface Group {
  id: number;
  groupName: string;
  createdAt: string;
}

type EditGroupFormProps = {
  group: Group;
  onSave: (updatedData: Partial<Group>) => void;
  onCancel: () => void;
};

export default function EditGroupForm({ group, onSave, onCancel }: EditGroupFormProps) {
  const [formData, setFormData] = useState({
    groupName: group.groupName,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.groupName.trim()) {
      alert('Group name is required.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[var(--background)] white-shadow rounded-lg p-6 my-8">
      <h2 className="text-2xl font-bold mb-6 form-label">Edit Group (ID: {group.id})</h2>
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
            className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
          />
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
