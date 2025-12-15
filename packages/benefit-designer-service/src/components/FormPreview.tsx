'use client';

import { useState, useEffect } from 'react';
import type { FieldDefinition } from '@/lib/schema';

type FormPreviewProps = {
  templateName: string;
  fields: FieldDefinition[];
  defaultValues: Record<string, unknown>;
};

export default function FormPreview({ templateName, fields, defaultValues }: FormPreviewProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});

  // Reset values when defaultValues change
  useEffect(() => {
    setValues({ ...defaultValues });
  }, [defaultValues]);

  const updateValue = (fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const formatMoneyDisplay = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '';
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(value);
  };

  const renderField = (field: FieldDefinition) => {
    const value = values[field.id];
    const commonClasses =
      'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent';

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={String(value || '')}
            onChange={(e) => updateValue(field.id, e.target.value)}
            className={commonClasses}
            placeholder={field.placeholder}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={String(value || '')}
            onChange={(e) => updateValue(field.id, e.target.value)}
            rows={3}
            className={commonClasses}
            placeholder={field.placeholder}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value !== undefined ? String(value) : ''}
            onChange={(e) => updateValue(field.id, e.target.value ? parseFloat(e.target.value) : undefined)}
            className={commonClasses}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            step={field.validation?.decimals ? Math.pow(10, -field.validation.decimals) : undefined}
          />
        );

      case 'money':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={value !== undefined ? String(value) : ''}
              onChange={(e) => updateValue(field.id, e.target.value ? parseFloat(e.target.value) : undefined)}
              className={`${commonClasses} pl-7`}
              placeholder={field.placeholder || '0.00'}
              min={field.validation?.min}
              max={field.validation?.max}
              step={field.validation?.decimals ? Math.pow(10, -field.validation.decimals) : 0.01}
            />
          </div>
        );

      case 'percentage':
        return (
          <div className="relative">
            <input
              type="number"
              value={value !== undefined ? String(value) : ''}
              onChange={(e) => updateValue(field.id, e.target.value ? parseFloat(e.target.value) : undefined)}
              className={`${commonClasses} pr-8`}
              placeholder={field.placeholder || '0'}
              min={field.validation?.min ?? 0}
              max={field.validation?.max ?? 100}
              step={field.validation?.decimals ? Math.pow(10, -field.validation.decimals) : 1}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={String(value || '')}
            onChange={(e) => updateValue(field.id, e.target.value)}
            className={commonClasses}
            min={field.validation?.minDate === 'today' ? new Date().toISOString().split('T')[0] : undefined}
            max={field.validation?.maxDate === 'today' ? new Date().toISOString().split('T')[0] : undefined}
          />
        );

      case 'dropdown':
        return (
          <select
            value={String(value || '')}
            onChange={(e) => updateValue(field.id, e.target.value)}
            className={commonClasses}
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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => updateValue(field.id, e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {field.placeholder || 'Yes'}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Form Preview</h3>
        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          Live Preview
        </span>
      </div>

      {/* Preview Frame */}
      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-h-[400px]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 max-w-md mx-auto">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {templateName}
          </h4>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>Add fields to see the preview</p>
            </div>
          ) : (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.name || 'Untitled Field'}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {field.description}
                    </p>
                  )}
                  {renderField(field)}
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  className="w-full px-4 py-2 text-white rounded-md hover:opacity-80 transition-colors"
                  style={{ backgroundColor: '#FFA500' }}
                >
                  Submit (Preview)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Field Count & Debug Info */}
      <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
        <span>{fields.length} field{fields.length !== 1 ? 's' : ''}</span>
        <span>
          {fields.filter((f) => f.required).length} required
        </span>
      </div>
    </div>
  );
}
