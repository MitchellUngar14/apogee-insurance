'use client';

import React, { useState } from 'react';
import type { FieldDefinition } from '@/lib/benefitDesignerClient';
import type { QuoteBenefit } from './ViewQuoteBenefits';

type EditBenefitFormProps = {
  benefit: QuoteBenefit;
  onSave: (benefitId: number, configuredValues: Record<string, unknown>) => void;
  onCancel: () => void;
};

export default function EditBenefitForm({
  benefit,
  onSave,
  onCancel,
}: EditBenefitFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(benefit.configuredValues || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fields: FieldDefinition[] = benefit.fieldSchema?.fields || [];

  const updateValue = (fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const field of fields) {
      const value = values[field.id];

      if (field.required && (value === undefined || value === '' || value === null)) {
        newErrors[field.id] = `${field.name} is required`;
        continue;
      }

      if (value === undefined || value === '' || value === null) {
        continue;
      }

      if (field.validation) {
        const val = field.validation;

        if (field.type === 'number' || field.type === 'money' || field.type === 'percentage') {
          const numVal = Number(value);
          if (isNaN(numVal)) {
            newErrors[field.id] = val.message || 'Must be a valid number';
          } else {
            if (val.min !== undefined && numVal < val.min) {
              newErrors[field.id] = val.message || `Minimum value is ${val.min}`;
            }
            if (val.max !== undefined && numVal > val.max) {
              newErrors[field.id] = val.message || `Maximum value is ${val.max}`;
            }
          }
        }

        if (field.type === 'text' || field.type === 'textarea') {
          const strVal = String(value);
          if (val.minLength && strVal.length < val.minLength) {
            newErrors[field.id] = val.message || `Minimum length is ${val.minLength} characters`;
          }
          if (val.maxLength && strVal.length > val.maxLength) {
            newErrors[field.id] = val.message || `Maximum length is ${val.maxLength} characters`;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(benefit.id, values);
    }
  };

  const renderField = (field: FieldDefinition) => {
    const value = values[field.id];
    const error = errors[field.id];
    const baseClasses = `mt-1 block w-full rounded-md shadow-sm p-2 border text-black dark:text-white bg-white dark:bg-gray-800 ${
      error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
    } focus:ring-2 focus:ring-green-500 focus:border-green-500`;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={String(value || '')}
            onChange={(e) => updateValue(field.id, e.target.value)}
            className={baseClasses}
            placeholder={field.placeholder}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={String(value || '')}
            onChange={(e) => updateValue(field.id, e.target.value)}
            rows={3}
            className={baseClasses}
            placeholder={field.placeholder}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value !== undefined && value !== null ? String(value) : ''}
            onChange={(e) =>
              updateValue(field.id, e.target.value ? parseFloat(e.target.value) : undefined)
            }
            className={baseClasses}
            min={field.validation?.min}
            max={field.validation?.max}
            placeholder={field.placeholder}
          />
        );

      case 'money':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              $
            </span>
            <input
              type="number"
              value={value !== undefined && value !== null ? String(value) : ''}
              onChange={(e) =>
                updateValue(field.id, e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className={`${baseClasses} pl-7`}
              step="0.01"
              min={field.validation?.min}
              max={field.validation?.max}
              placeholder={field.placeholder || '0.00'}
            />
          </div>
        );

      case 'percentage':
        return (
          <div className="relative">
            <input
              type="number"
              value={value !== undefined && value !== null ? String(value) : ''}
              onChange={(e) =>
                updateValue(field.id, e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className={`${baseClasses} pr-8`}
              min={field.validation?.min ?? 0}
              max={field.validation?.max ?? 100}
              placeholder={field.placeholder || '0'}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              %
            </span>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={String(value || '')}
            onChange={(e) => updateValue(field.id, e.target.value)}
            className={baseClasses}
          />
        );

      case 'dropdown':
        return (
          <select
            value={String(value || '')}
            onChange={(e) => updateValue(field.id, e.target.value)}
            className={baseClasses}
          >
            <option value="">{field.placeholder || 'Select an option...'}</option>
            {(field.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center mt-1">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => updateValue(field.id, e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-green-500 focus:ring-green-500"
            />
            {field.placeholder && (
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {field.placeholder}
              </span>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={String(value || '')}
            onChange={(e) => updateValue(field.id, e.target.value)}
            className={baseClasses}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[var(--background)] white-shadow rounded-lg p-6 my-8">
      {/* Header */}
      <div className="border-b border-gray-300 dark:border-gray-600 pb-4 mb-6">
        <h2 className="text-2xl font-bold form-label">Edit Benefit</h2>
        <div className="mt-2">
          <span className="text-lg font-medium text-black dark:text-white">
            {benefit.templateName}
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">
            v{benefit.templateVersion}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {benefit.categoryIcon} {benefit.categoryName}
          {benefit.instanceNumber > 1 && (
            <span className="ml-2 text-blue-500">(Instance {benefit.instanceNumber})</span>
          )}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {fields.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            This benefit has no configurable fields.
          </p>
        ) : (
          fields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium form-label">
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {field.description}
                </p>
              )}
              {renderField(field)}
              {errors[field.id] && (
                <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
              )}
            </div>
          ))
        )}

        {/* Buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-300 dark:border-gray-600">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-white rounded-md transition-colors"
            style={{ backgroundColor: '#22c55e' }}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
