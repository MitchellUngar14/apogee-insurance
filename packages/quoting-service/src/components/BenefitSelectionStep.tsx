'use client';

import React, { useState, useEffect } from 'react';
import type { BenefitTemplate } from '@/lib/benefitDesignerClient';

// Configured benefit (in-progress, not yet saved to DB)
export interface ConfiguredBenefit {
  localId: string; // Temporary ID for tracking before save
  template: BenefitTemplate;
  configuredValues: Record<string, unknown>;
  instanceNumber: number;
}

type BenefitSelectionStepProps = {
  configuredBenefits: ConfiguredBenefit[];
  onConfigureBenefit: (template: BenefitTemplate, existingBenefit?: ConfiguredBenefit) => void;
  onRemoveBenefit: (localId: string) => void;
  onPrevious: () => void;
  onFinish: () => void;
};

export default function BenefitSelectionStep({
  configuredBenefits,
  onConfigureBenefit,
  onRemoveBenefit,
  onPrevious,
  onFinish,
}: BenefitSelectionStepProps) {
  const [availableTemplates, setAvailableTemplates] = useState<BenefitTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleAddBenefit = (template: BenefitTemplate) => {
    onConfigureBenefit(template);
  };

  const handleEditBenefit = (benefit: ConfiguredBenefit) => {
    onConfigureBenefit(benefit.template, benefit);
  };

  // Group templates by category for display
  const templatesByCategory = availableTemplates.reduce((acc, template) => {
    const category = template.categoryName || 'Other';
    if (!acc[category]) {
      acc[category] = { icon: template.categoryIcon, templates: [] };
    }
    acc[category].templates.push(template);
    return acc;
  }, {} as Record<string, { icon: string | null; templates: BenefitTemplate[] }>);

  return (
    <div className="space-y-6">
      {/* Configured Benefits Section */}
      <div>
        <h3 className="text-lg font-semibold form-label border-b border-gray-300 dark:border-gray-600 pb-2 mb-4">
          Selected Benefits ({configuredBenefits.length})
        </h3>
        {configuredBenefits.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No benefits selected yet. Add benefits from the list below.
          </p>
        ) : (
          <ul className="space-y-2">
            {configuredBenefits.map((benefit) => (
              <li
                key={benefit.localId}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div>
                  <span className="font-medium text-black dark:text-white">
                    {benefit.template.name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                    v{benefit.template.version}
                  </span>
                  {benefit.instanceNumber > 1 && (
                    <span className="text-blue-500 text-sm ml-2">
                      (Instance {benefit.instanceNumber})
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditBenefit(benefit)}
                    className="text-blue-500 hover:text-blue-700 px-2 py-1 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveBenefit(benefit.localId)}
                    className="text-red-500 hover:text-red-700 px-2 py-1 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Available Templates Section */}
      <div>
        <h3 className="text-lg font-semibold form-label border-b border-gray-300 dark:border-gray-600 pb-2 mb-4">
          Available Benefits
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className="ml-2 text-gray-500">Loading templates...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchTemplates}
              className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : availableTemplates.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No benefit templates available. Please contact your administrator.
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(templatesByCategory).map(([category, { icon, templates }]) => (
              <div key={category}>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  {icon && <span className="mr-2">{icon}</span>}
                  {category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:border-green-400 dark:hover:border-green-500 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-black dark:text-white">
                            {template.name}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-sm">
                            Version {template.version}
                          </div>
                          {template.description && (
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                              {template.description}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddBenefit(template)}
                          className="ml-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-4 border-t border-gray-300 dark:border-gray-600">
        <button
          type="button"
          onClick={onPrevious}
          className="px-6 py-2 text-white rounded-md transition-colors"
          style={{ backgroundColor: '#22c55e' }}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onFinish}
          className="px-6 py-2 text-white rounded-md transition-colors"
          style={{ backgroundColor: '#22c55e' }}
        >
          Finish
        </button>
      </div>
    </div>
  );
}
