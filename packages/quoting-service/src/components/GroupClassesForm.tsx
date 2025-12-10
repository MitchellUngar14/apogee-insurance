'use client';

import React, { useState, useEffect } from 'react';

type EmployeeClass = {
  id?: number;
  className: string;
  description?: string;
};

type GroupClassesFormProps = {
  initialData?: {
    groupId?: number;
    groupName?: string;
    classes?: EmployeeClass[];
  };
  onNext?: (data: any) => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
};

export default function GroupClassesForm({
  initialData,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
}: GroupClassesFormProps) {
  const [classes, setClasses] = useState<EmployeeClass[]>(
    initialData?.classes || []
  );
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData?.classes) {
      setClasses(initialData.classes);
    }
  }, [initialData]);

  const handleAddClass = () => {
    if (!newClassName.trim()) {
      setError('Class name is required');
      return;
    }

    // Check for duplicate class names
    if (classes.some((c) => c.className.toLowerCase() === newClassName.trim().toLowerCase())) {
      setError('A class with this name already exists');
      return;
    }

    setClasses([
      ...classes,
      {
        className: newClassName.trim(),
        description: newClassDescription.trim() || undefined,
      },
    ]);
    setNewClassName('');
    setNewClassDescription('');
    setError('');
  };

  const handleRemoveClass = (index: number) => {
    setClasses(classes.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (classes.length === 0) {
      setError('Please add at least one employee class');
      return;
    }

    onNext?.({
      ...initialData,
      classes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2 text-white">
          Employee Classes for {initialData?.groupName || 'Group'}
        </h3>
        <p className="text-sm text-white/80 mb-4">
          Define the employee classification tiers (e.g., Executive, Manager, Employee).
          Each class can have different benefit coverages.
        </p>
      </div>

      {/* Add new class form */}
      <div className="border rounded-lg p-4 bg-white">
        <h4 className="font-medium mb-3 text-black">Add New Class</h4>
        <div className="space-y-3">
          <div>
            <label htmlFor="className" className="block text-sm font-medium text-black">
              Class Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="className"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g., Executive, Manager, Employee"
              className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
            />
          </div>
          <div>
            <label htmlFor="classDescription" className="block text-sm font-medium text-black">
              Description (Optional)
            </label>
            <input
              type="text"
              id="classDescription"
              value={newClassDescription}
              onChange={(e) => setNewClassDescription(e.target.value)}
              placeholder="Brief description of this class"
              className="mt-1 block w-full rounded-md shadow-sm p-2 border text-black bg-white"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="button"
            onClick={handleAddClass}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            + Add Class
          </button>
        </div>
      </div>

      {/* List of classes */}
      <div>
        <h4 className="font-medium mb-3 text-white">
          Defined Classes ({classes.length})
        </h4>
        {classes.length === 0 ? (
          <p className="text-white/70 italic">No classes defined yet. Add at least one class to continue.</p>
        ) : (
          <ul className="space-y-2">
            {classes.map((cls, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-3 bg-white border rounded-lg"
              >
                <div>
                  <span className="font-medium text-black">{cls.className}</span>
                  {cls.description && (
                    <span className="text-gray-600 text-sm ml-2">- {cls.description}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveClass(index)}
                  className="text-red-500 hover:text-red-700 px-2 py-1"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirstStep}
          className="px-6 py-2 text-white rounded-md hover:bg-soft-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
