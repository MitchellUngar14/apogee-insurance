'use client';

import React, { useState } from 'react';
import type { BenefitTemplate, FieldDefinition } from '@/lib/benefitDesignerClient';
import type { ConfiguredBenefit } from './BenefitSelectionStep';

type BenefitConfigurationStepProps = {
  template: BenefitTemplate;
  existingBenefit?: ConfiguredBenefit;
  onSave: (values: Record<string, unknown>) => void;
  onCancel: () => void;
};

export default function BenefitConfigurationStep({
  template,
  existingBenefit,
  onSave,
  onCancel,
}: BenefitConfigurationStepProps) {
  const [values, setValues] = useState<Record<string, unknown>>(
    existingBenefit?.configuredValues || template.defaultValues || {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fields: FieldDefinition[] = (template.fieldSchema as { fields: FieldDefinition[] })?.fields || [];

  const updateValue = (fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error on change
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

      // Required validation
      if (field.required && (value === undefined || value === '' || value === null)) {
        newErrors[field.id] = `${field.name} is required`;
        continue;
      }

      // Skip further validation if empty and not required
      if (value === undefined || value === '' || value === null) {
        continue;
      }

      // Type-specific validations
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
          if (val.pattern) {
            const regex = new RegExp(val.pattern);
            if (!regex.test(strVal)) {
              newErrors[field.id] = val.message || 'Invalid format';
            }
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
      onSave(values);
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
            step={field.validation?.decimals ? Math.pow(10, -field.validation.decimals) : 'any'}
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
              step={field.validation?.decimals ? Math.pow(10, -field.validation.decimals) : '0.01'}
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
            min={field.validation?.minDate === 'today' ? new Date().toISOString().split('T')[0] : field.validation?.minDate}
            max={field.validation?.maxDate === 'today' ? new Date().toISOString().split('T')[0] : field.validation?.maxDate}
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
    <div className="space-y-6">
      {/* Template Info Header */}
      <div className="border-b border-gray-300 dark:border-gray-600 pb-4">
        <h3 className="text-xl font-semibold text-black dark:text-white">{template.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Version {template.version} &bull; {template.categoryName}
        </p>
        {template.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{template.description}</p>
        )}
      </div>

      {/* Dynamic Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {fields.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            This benefit template has no configurable fields.
          </p>
        ) : (
          fields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium form-label">
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{field.description}</p>
              )}
              {renderField(field)}
              {errors[field.id] && (
                <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
              )}
            </div>
          ))
        )}

        {/* Navigation Buttons */}
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
            Save Benefit
          </button>
        </div>
      </form>
    </div>
  );
}
