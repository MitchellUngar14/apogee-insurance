'use client';

import React, { useState, useEffect } from 'react';
import type { BenefitTemplate, FieldDefinition } from '@/lib/benefitDesignerClient';
import type { QuoteBenefit } from './ViewQuoteBenefits';

type AddBenefitFlowProps = {
  quoteId: number;
  existingBenefits: QuoteBenefit[];
  onSave: (benefit: {
    templateDbId: number;
    templateUuid: string;
    templateName: string;
    templateVersion: string;
    categoryName: string;
    categoryIcon: string | null;
    fieldSchema: { fields: FieldDefinition[] };
    configuredValues: Record<string, unknown>;
    instanceNumber: number;
  }) => void;
  onCancel: () => void;
};

type FlowStep = 'select' | 'configure';

export default function AddBenefitFlow({
  quoteId,
  existingBenefits,
  onSave,
  onCancel,
}: AddBenefitFlowProps) {
  const [step, setStep] = useState<FlowStep>('select');
  const [availableTemplates, setAvailableTemplates] = useState<BenefitTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<BenefitTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuration state
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates-proxy?type=individual');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const templates = await response.json();
      setAvailableTemplates(templates);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: BenefitTemplate) => {
    setSelectedTemplate(template);
    setValues(template.defaultValues || {});
    setFormErrors({});
    setStep('configure');
  };

  const handleBackToSelect = () => {
    setSelectedTemplate(null);
    setValues({});
    setFormErrors({});
    setStep('select');
  };

  const updateValue = (fieldId: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    if (formErrors[fieldId]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    if (!selectedTemplate) return false;
    const fields: FieldDefinition[] = (selectedTemplate.fieldSchema as { fields: FieldDefinition[] })?.fields || [];
    const newErrors: Record<string, string> = {};

    for (const field of fields) {
      const value = values[field.id];

      if (field.required && (value === undefined || value === '' || value === null)) {
        newErrors[field.id] = `${field.name} is required`;
        continue;
      }

      if (value === undefined || value === '' || value === null) continue;

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
      }
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!selectedTemplate || !validateForm()) return;

    // Calculate instance number
    const instanceCount = existingBenefits.filter(
      (b) => b.templateUuid === selectedTemplate.templateId
    ).length;

    onSave({
      templateDbId: selectedTemplate.id,
      templateUuid: selectedTemplate.templateId,
      templateName: selectedTemplate.name,
      templateVersion: selectedTemplate.version,
      categoryName: selectedTemplate.categoryName,
      categoryIcon: selectedTemplate.categoryIcon,
      fieldSchema: selectedTemplate.fieldSchema as { fields: FieldDefinition[] },
      configuredValues: values,
      instanceNumber: instanceCount + 1,
    });
  };

  // Group templates by category
  const templatesByCategory = availableTemplates.reduce((acc, template) => {
    const category = template.categoryName || 'Other';
    if (!acc[category]) {
      acc[category] = { icon: template.categoryIcon, templates: [] };
    }
    acc[category].templates.push(template);
    return acc;
  }, {} as Record<string, { icon: string | null; templates: BenefitTemplate[] }>);

  const renderField = (field: FieldDefinition) => {
    const value = values[field.id];
    const error = formErrors[field.id];
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
            onChange={(e) => updateValue(field.id, e.target.value ? parseFloat(e.target.value) : undefined)}
            className={baseClasses}
            min={field.validation?.min}
            max={field.validation?.max}
            placeholder={field.placeholder}
          />
        );
      case 'money':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={value !== undefined && value !== null ? String(value) : ''}
              onChange={(e) => updateValue(field.id, e.target.value ? parseFloat(e.target.value) : undefined)}
              className={`${baseClasses} pl-7`}
              step="0.01"
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
              onChange={(e) => updateValue(field.id, e.target.value ? parseFloat(e.target.value) : undefined)}
              className={`${baseClasses} pr-8`}
              min={0}
              max={100}
              placeholder={field.placeholder || '0'}
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
            <option value="">{field.placeholder || 'Select...'}</option>
            {(field.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
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
              className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
            />
            {field.placeholder && (
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{field.placeholder}</span>
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

  // Template Selection Step
  if (step === 'select') {
    return (
      <div className="w-full max-w-2xl mx-auto bg-[var(--background)] white-shadow rounded-lg p-6 my-8">
        <h2 className="text-2xl font-bold form-label mb-6">Add Benefit</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Select a benefit template to add to this quote.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className="ml-2 text-gray-500">Loading templates...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button onClick={fetchTemplates} className="mt-2 text-sm text-red-500 hover:text-red-700 underline">
              Try again
            </button>
          </div>
        ) : availableTemplates.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No benefit templates available.
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(templatesByCategory).map(([category, { icon, templates }]) => (
              <div key={category}>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  {icon && <span className="mr-2">{icon}</span>}
                  {category}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:border-green-400 dark:hover:border-green-500 transition-colors text-left"
                    >
                      <div className="font-medium text-black dark:text-white">
                        {template.name}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">
                        Version {template.version}
                      </div>
                      {template.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                          {template.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-start mt-8 pt-4 border-t border-gray-300 dark:border-gray-600">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Configuration Step
  const fields: FieldDefinition[] = (selectedTemplate?.fieldSchema as { fields: FieldDefinition[] })?.fields || [];

  return (
    <div className="w-full max-w-2xl mx-auto bg-[var(--background)] white-shadow rounded-lg p-6 my-8">
      <div className="border-b border-gray-300 dark:border-gray-600 pb-4 mb-6">
        <h2 className="text-2xl font-bold form-label">Configure Benefit</h2>
        <div className="mt-2">
          <span className="text-lg font-medium text-black dark:text-white">
            {selectedTemplate?.name}
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">
            v{selectedTemplate?.version}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {selectedTemplate?.categoryIcon} {selectedTemplate?.categoryName}
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-5">
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{field.description}</p>
              )}
              {renderField(field)}
              {formErrors[field.id] && (
                <p className="text-red-500 text-sm mt-1">{formErrors[field.id]}</p>
              )}
            </div>
          ))
        )}

        <div className="flex justify-between mt-8 pt-4 border-t border-gray-300 dark:border-gray-600">
          <button
            type="button"
            onClick={handleBackToSelect}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-white rounded-md transition-colors"
            style={{ backgroundColor: '#22c55e' }}
          >
            Add Benefit
          </button>
        </div>
      </form>
    </div>
  );
}
