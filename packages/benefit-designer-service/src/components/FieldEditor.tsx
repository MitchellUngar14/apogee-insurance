'use client';

import { useState } from 'react';
import type { FieldDefinition, FieldType, FieldValidation, DropdownOption } from '@/lib/schema';

type FieldEditorProps = {
  fields: FieldDefinition[];
  onChange: (fields: FieldDefinition[]) => void;
  defaultValues: Record<string, unknown>;
  onDefaultValuesChange: (values: Record<string, unknown>) => void;
};

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'money', label: 'Money ($)' },
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'date', label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
];

export default function FieldEditor({
  fields,
  onChange,
  defaultValues,
  onDefaultValuesChange,
}: FieldEditorProps) {
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addField = () => {
    const newField: FieldDefinition = {
      id: generateId(),
      name: '',
      type: 'text',
      required: false,
    };
    onChange([...fields, newField]);
    setExpandedField(newField.id);
  };

  const updateField = (id: string, updates: Partial<FieldDefinition>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
    const newDefaults = { ...defaultValues };
    delete newDefaults[id];
    onDefaultValuesChange(newDefaults);
    if (expandedField === id) setExpandedField(null);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    onChange(newFields);
  };

  const duplicateField = (field: FieldDefinition) => {
    const newField: FieldDefinition = {
      ...field,
      id: generateId(),
      name: `${field.name} (Copy)`,
    };
    const index = fields.findIndex((f) => f.id === field.id);
    const newFields = [...fields];
    newFields.splice(index + 1, 0, newField);
    onChange(newFields);
  };

  const updateValidation = (id: string, validation: FieldValidation | undefined) => {
    updateField(id, { validation });
  };

  const updateOptions = (id: string, options: DropdownOption[]) => {
    updateField(id, { options });
  };

  const updateDefaultValue = (fieldId: string, value: unknown) => {
    onDefaultValuesChange({ ...defaultValues, [fieldId]: value });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Form Fields</h3>
        <button
          onClick={addField}
          className="px-3 py-1 text-sm text-white rounded-md hover:opacity-80"
          style={{ backgroundColor: '#FFA500' }}
        >
          + Add Field
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No fields added yet.</p>
          <p className="text-sm">Click "Add Field" to start building your form.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Field Header */}
              <div
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
                onClick={() => setExpandedField(expandedField === field.id ? null : field.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">{index + 1}.</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {field.name || 'Untitled Field'}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-300">
                    {FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type}
                  </span>
                  {field.required && (
                    <span className="text-xs text-red-500">*</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveField(index, 'up');
                    }}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    &#x25B2;
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveField(index, 'down');
                    }}
                    disabled={index === fields.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    &#x25BC;
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateField(field);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500"
                    title="Duplicate"
                  >
                    &#x2398;
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeField(field.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Delete"
                  >
                    &#x2715;
                  </button>
                  <span className="ml-2 text-gray-400">
                    {expandedField === field.id ? '&#x25B2;' : '&#x25BC;'}
                  </span>
                </div>
              </div>

              {/* Field Details (Expanded) */}
              {expandedField === field.id && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Field Name *
                      </label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(field.id, { name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g., Annual Maximum"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Field Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(field.id, {
                            type: e.target.value as FieldType,
                            options: e.target.value === 'dropdown' ? [] : undefined,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description & Placeholder */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description (Help Text)
                      </label>
                      <input
                        type="text"
                        value={field.description || ''}
                        onChange={(e) => updateField(field.id, { description: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Helpful description for the user"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Placeholder text..."
                      />
                    </div>
                  </div>

                  {/* Required & Default Value */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`required-${field.id}`}
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label
                        htmlFor={`required-${field.id}`}
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        Required Field
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Default Value
                      </label>
                      {field.type === 'checkbox' ? (
                        <select
                          value={String(defaultValues[field.id] || 'false')}
                          onChange={(e) =>
                            updateDefaultValue(field.id, e.target.value === 'true')
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="false">Unchecked</option>
                          <option value="true">Checked</option>
                        </select>
                      ) : field.type === 'dropdown' ? (
                        <select
                          value={String(defaultValues[field.id] || '')}
                          onChange={(e) => updateDefaultValue(field.id, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">No default</option>
                          {(field.options || []).map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={
                            field.type === 'date'
                              ? 'date'
                              : ['money', 'percentage', 'number'].includes(field.type)
                              ? 'number'
                              : 'text'
                          }
                          value={String(defaultValues[field.id] || '')}
                          onChange={(e) =>
                            updateDefaultValue(
                              field.id,
                              ['money', 'percentage', 'number'].includes(field.type)
                                ? parseFloat(e.target.value) || ''
                                : e.target.value
                            )
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      )}
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  {field.type === 'dropdown' && (
                    <DropdownOptionsEditor
                      options={field.options || []}
                      onChange={(opts) => updateOptions(field.id, opts)}
                    />
                  )}

                  {/* Validation Rules */}
                  <ValidationEditor
                    fieldType={field.type}
                    validation={field.validation}
                    onChange={(v) => updateValidation(field.id, v)}
                    allFields={fields}
                    currentFieldId={field.id}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-component for dropdown options
function DropdownOptionsEditor({
  options,
  onChange,
}: {
  options: DropdownOption[];
  onChange: (options: DropdownOption[]) => void;
}) {
  const addOption = () => {
    onChange([...options, { value: '', label: '' }]);
  };

  const updateOption = (index: number, key: 'value' | 'label', value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [key]: value };
    // Auto-fill value from label if value is empty
    if (key === 'label' && !newOptions[index].value) {
      newOptions[index].value = value.toLowerCase().replace(/\s+/g, '_');
    }
    onChange(newOptions);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Dropdown Options
        </label>
        <button
          onClick={addOption}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          + Add Option
        </button>
      </div>
      {options.length === 0 ? (
        <p className="text-sm text-gray-500">No options defined. Add at least one option.</p>
      ) : (
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={opt.label}
                onChange={(e) => updateOption(i, 'label', e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Label"
              />
              <input
                type="text"
                value={opt.value}
                onChange={(e) => updateOption(i, 'value', e.target.value)}
                className="w-32 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Value"
              />
              <button
                onClick={() => removeOption(i)}
                className="text-red-500 hover:text-red-600"
              >
                &#x2715;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-component for validation rules
function ValidationEditor({
  fieldType,
  validation,
  onChange,
  allFields,
  currentFieldId,
}: {
  fieldType: FieldType;
  validation?: FieldValidation;
  onChange: (v: FieldValidation | undefined) => void;
  allFields: FieldDefinition[];
  currentFieldId: string;
}) {
  const v = validation || {};

  const update = (key: keyof FieldValidation, value: unknown) => {
    if (value === '' || value === undefined) {
      const newV = { ...v };
      delete newV[key];
      onChange(Object.keys(newV).length > 0 ? newV : undefined);
    } else {
      onChange({ ...v, [key]: value });
    }
  };

  const showNumericValidation = ['number', 'money', 'percentage'].includes(fieldType);
  const showTextValidation = ['text', 'textarea'].includes(fieldType);
  const showDateValidation = fieldType === 'date';

  const otherFields = allFields.filter((f) => f.id !== currentFieldId);

  return (
    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Validation Rules
      </label>

      <div className="space-y-3">
        {/* Numeric validation */}
        {showNumericValidation && (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min Value</label>
              <input
                type="number"
                value={v.min ?? ''}
                onChange={(e) =>
                  update('min', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max Value</label>
              <input
                type="number"
                value={v.max ?? ''}
                onChange={(e) =>
                  update('max', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Decimals</label>
              <input
                type="number"
                min="0"
                max="10"
                value={v.decimals ?? ''}
                onChange={(e) =>
                  update('decimals', e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Text validation */}
        {showTextValidation && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min Length</label>
              <input
                type="number"
                min="0"
                value={v.minLength ?? ''}
                onChange={(e) =>
                  update('minLength', e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max Length</label>
              <input
                type="number"
                min="0"
                value={v.maxLength ?? ''}
                onChange={(e) =>
                  update('maxLength', e.target.value ? parseInt(e.target.value, 10) : undefined)
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Date validation */}
        {showDateValidation && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min Date</label>
              <select
                value={v.minDate || ''}
                onChange={(e) => update('minDate', e.target.value || undefined)}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">No minimum</option>
                <option value="today">Today</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max Date</label>
              <select
                value={v.maxDate || ''}
                onChange={(e) => update('maxDate', e.target.value || undefined)}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">No maximum</option>
                <option value="today">Today</option>
              </select>
            </div>
          </div>
        )}

        {/* Cross-field validation (numeric fields only) */}
        {showNumericValidation && otherFields.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Less Than Field</label>
              <select
                value={v.lessThanField || ''}
                onChange={(e) => update('lessThanField', e.target.value || undefined)}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">None</option>
                {otherFields
                  .filter((f) => ['number', 'money', 'percentage'].includes(f.type))
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name || 'Untitled'}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Greater Than Field</label>
              <select
                value={v.greaterThanField || ''}
                onChange={(e) => update('greaterThanField', e.target.value || undefined)}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">None</option>
                {otherFields
                  .filter((f) => ['number', 'money', 'percentage'].includes(f.type))
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name || 'Untitled'}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}

        {/* Custom error message */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Custom Error Message</label>
          <input
            type="text"
            value={v.message || ''}
            onChange={(e) => update('message', e.target.value || undefined)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Error message to show when validation fails"
          />
        </div>
      </div>
    </div>
  );
}
