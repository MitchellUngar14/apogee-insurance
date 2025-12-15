'use client';

import React, { useState } from 'react';
import type { FieldDefinition } from '@/lib/benefitDesignerClient';

export interface QuoteBenefit {
  id: number;
  quoteId: number;
  templateDbId: number;
  templateUuid: string;
  templateName: string;
  templateVersion: string;
  categoryName: string;
  categoryIcon: string | null;
  fieldSchema: { fields: FieldDefinition[] };
  configuredValues: Record<string, unknown>;
  instanceNumber: number;
  createdAt: string;
  updatedAt: string;
}

type ViewQuoteBenefitsProps = {
  benefits: QuoteBenefit[];
  onEditBenefit: (benefit: QuoteBenefit) => void;
  onDeleteBenefit: (benefitId: number) => void;
};

export default function ViewQuoteBenefits({
  benefits,
  onEditBenefit,
  onDeleteBenefit,
}: ViewQuoteBenefitsProps) {
  const [expandedBenefits, setExpandedBenefits] = useState<Set<number>>(new Set());

  const toggleExpanded = (benefitId: number) => {
    setExpandedBenefits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(benefitId)) {
        newSet.delete(benefitId);
      } else {
        newSet.add(benefitId);
      }
      return newSet;
    });
  };

  const formatFieldValue = (field: FieldDefinition, value: unknown): string => {
    if (value === undefined || value === null || value === '') {
      return 'Not set';
    }

    switch (field.type) {
      case 'money':
        return `$${Number(value).toFixed(2)}`;
      case 'percentage':
        return `${value}%`;
      case 'checkbox':
        return value ? 'Yes' : 'No';
      case 'dropdown':
        const option = field.options?.find((opt) => opt.value === value);
        return option?.label || String(value);
      default:
        return String(value);
    }
  };

  const handleDelete = (benefitId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this benefit from the quote?')) {
      onDeleteBenefit(benefitId);
    }
  };

  if (benefits.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 italic">
        No benefits configured for this quote.
      </div>
    );
  }

  // Group benefits by category
  const benefitsByCategory = benefits.reduce((acc, benefit) => {
    const category = benefit.categoryName || 'Other';
    if (!acc[category]) {
      acc[category] = { icon: benefit.categoryIcon, benefits: [] };
    }
    acc[category].benefits.push(benefit);
    return acc;
  }, {} as Record<string, { icon: string | null; benefits: QuoteBenefit[] }>);

  return (
    <div className="space-y-4">
      {Object.entries(benefitsByCategory).map(([category, { icon, benefits: categoryBenefits }]) => (
        <div key={category}>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {category}
          </h4>
          <div className="space-y-2">
            {categoryBenefits.map((benefit) => {
              const isExpanded = expandedBenefits.has(benefit.id);
              const fields = benefit.fieldSchema?.fields || [];

              return (
                <div
                  key={benefit.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  {/* Benefit Header */}
                  <div
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => toggleExpanded(benefit.id)}
                  >
                    <div className="flex items-center">
                      <span
                        className="mr-2 text-gray-600 dark:text-gray-400 transition-transform duration-200"
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      >
                        ▶
                      </span>
                      <span className="font-medium text-black dark:text-white">
                        {benefit.templateName}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                        v{benefit.templateVersion}
                      </span>
                      {benefit.instanceNumber > 1 && (
                        <span className="text-blue-500 text-sm ml-2">
                          (Instance {benefit.instanceNumber})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onEditBenefit(benefit)}
                        className="px-3 py-1 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                        style={{ backgroundColor: '#22c55e' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDelete(benefit.id, e)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Benefit Details - Expandable */}
                  {isExpanded && (
                    <div className="p-4 bg-white dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                      {fields.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                          No configurable fields for this benefit.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {fields.map((field) => (
                            <div key={field.id} className="flex flex-col">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {field.name}
                              </span>
                              <span className="text-black dark:text-white">
                                {formatFieldValue(field, benefit.configuredValues[field.id])}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
