'use client';

import { useState, useEffect } from 'react';

type Template = {
  id: number;
  templateId: string;
  categoryId: number;
  categoryName: string | null;
  categoryIcon: string | null;
  type: 'group' | 'individual';
  name: string;
  description: string | null;
  version: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
};

type ViewBenefitsProps = {
  onBack: () => void;
  onEditTemplate: (templateId: number) => void;
  onCreateNew: () => void;
};

export default function ViewBenefits({ onBack, onEditTemplate, onCreateNew }: ViewBenefitsProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'group' | 'individual'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'archived'>('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates?latest=true');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-500';
      case 'active':
        return 'bg-green-500';
      case 'archived':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'group' ? 'bg-blue-500' : 'bg-purple-500';
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading templates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center text-red-500">{error}</div>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 text-white rounded-md hover:opacity-80 transition-colors"
          style={{ backgroundColor: '#FFA500' }}
        >
          &larr; Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold form-label">Benefit Templates</h2>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 text-white rounded-md hover:opacity-80 transition-colors"
          style={{ backgroundColor: '#FFA500' }}
        >
          + Create New Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="form-label text-sm">Type:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="group">Group</option>
            <option value="individual">Individual</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="form-label text-sm">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="form-label text-gray-600 dark:text-gray-400 mb-4">
            {templates.length === 0
              ? 'No benefit templates have been created yet.'
              : 'No templates match the selected filters.'}
          </p>
          {templates.length === 0 && (
            <button
              onClick={onCreateNew}
              className="px-6 py-2 text-white rounded-md hover:opacity-80 transition-colors"
              style={{ backgroundColor: '#FFA500' }}
            >
              Create Your First Template
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onEditTemplate(template.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{template.categoryIcon || '📋'}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                </div>
                <span className="text-xs text-gray-500">v{template.version}</span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {template.description || 'No description'}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2 py-0.5 text-xs text-white rounded ${getStatusColor(template.status)}`}
                >
                  {template.status}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs text-white rounded ${getTypeColor(template.type)}`}
                >
                  {template.type}
                </span>
                {template.categoryName && (
                  <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                    {template.categoryName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onBack}
        className="px-6 py-2 text-white rounded-md hover:opacity-80 transition-colors"
        style={{ backgroundColor: '#FFA500' }}
      >
        &larr; Back
      </button>
    </div>
  );
}
