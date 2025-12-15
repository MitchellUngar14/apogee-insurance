'use client';

import { useState, useEffect } from 'react';
import FieldEditor from './FieldEditor';
import FormPreview from './FormPreview';
import type { FieldDefinition, FieldSchema } from '@/lib/schema';

type Category = {
  id: number;
  name: string;
  icon: string | null;
  appliesTo: string[];
};

type Template = {
  id: number;
  templateId: string;
  categoryId: number;
  type: 'group' | 'individual';
  name: string;
  description: string | null;
  version: string;
  majorVersion: number;
  minorVersion: number;
  fieldSchema: FieldSchema;
  defaultValues: Record<string, unknown>;
  status: 'draft' | 'active' | 'archived';
};

type TemplateDesignerProps = {
  templateId?: number;
  initialType?: 'group' | 'individual';
  onBack: () => void;
  onSave: () => void;
};

export default function TemplateDesigner({
  templateId,
  initialType,
  onBack,
  onSave,
}: TemplateDesignerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [type, setType] = useState<'group' | 'individual'>(initialType || 'group');
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [defaultValues, setDefaultValues] = useState<Record<string, unknown>>({});
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>('draft');
  const [existingTemplate, setExistingTemplate] = useState<Template | null>(null);

  // Fetch categories and template (if editing)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const catRes = await fetch('/api/categories');
        if (!catRes.ok) throw new Error('Failed to fetch categories');
        const catData = await catRes.json();
        setCategories(catData);

        // If editing, fetch template
        if (templateId) {
          const tempRes = await fetch(`/api/templates/${templateId}`);
          if (!tempRes.ok) throw new Error('Failed to fetch template');
          const tempData: Template = await tempRes.json();
          setExistingTemplate(tempData);
          setName(tempData.name);
          setDescription(tempData.description || '');
          setCategoryId(tempData.categoryId);
          setType(tempData.type);
          setFields(tempData.fieldSchema?.fields || []);
          setDefaultValues(tempData.defaultValues || {});
          setStatus(tempData.status);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [templateId]);

  // Filter categories by type
  const filteredCategories = categories.filter((cat) =>
    (cat.appliesTo as string[]).includes(type)
  );

  const handleSave = async (newStatus?: 'draft' | 'active') => {
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        name,
        description: description || null,
        categoryId,
        type,
        fieldSchema: { fields },
        defaultValues,
        status: newStatus || status,
      };

      let response;
      if (templateId) {
        // Update existing template
        response = await fetch(`/api/templates/${templateId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new template
        response = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save template');
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!templateId && !existingTemplate) {
      // Save as draft first, then publish
      await handleSave('active');
    } else {
      // Update status to active
      try {
        setSaving(true);
        const response = await fetch(`/api/templates/${templateId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'active' }),
        });

        if (!response.ok) throw new Error('Failed to publish');
        onSave();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to publish');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            &larr; Back
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {templateId ? 'Edit Template' : 'Create Template'}
            {existingTemplate && (
              <span className="ml-2 text-sm text-gray-500">v{existingTemplate.version}</span>
            )}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || fields.length === 0}
            className="px-4 py-2 text-white rounded-md hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: '#22c55e' }}
          >
            Publish
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
          {/* Template Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Template Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Standard Dental Plan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Brief description of the benefit template"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value as 'group' | 'individual');
                      setCategoryId('');
                    }}
                    disabled={!!templateId}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="group">Group</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
                    disabled={!!templateId}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="">Select category...</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Field Editor */}
          <FieldEditor
            fields={fields}
            onChange={setFields}
            defaultValues={defaultValues}
            onDefaultValuesChange={setDefaultValues}
          />
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 overflow-y-auto p-4 bg-white dark:bg-gray-800">
          <FormPreview
            templateName={name || 'Untitled Template'}
            fields={fields}
            defaultValues={defaultValues}
          />
        </div>
      </div>
    </div>
  );
}
