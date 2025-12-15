// HTTP Client for communicating with Benefit Designer Service

const BENEFIT_DESIGNER_URL = process.env.BENEFIT_DESIGNER_URL || 'http://localhost:3003';

// Type definitions (mirror from benefit-designer schema)
export type FieldType = 'money' | 'percentage' | 'number' | 'text' | 'textarea' | 'date' | 'dropdown' | 'checkbox';

export interface FieldValidation {
  min?: number;
  max?: number;
  decimals?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minDate?: string;
  maxDate?: string;
  message?: string;
  lessThanField?: string;
  greaterThanField?: string;
  requiredIf?: { field: string; value: unknown };
}

export interface DropdownOption {
  value: string;
  label: string;
}

export interface FieldDefinition {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  description?: string;
  placeholder?: string;
  options?: DropdownOption[];
  validation?: FieldValidation;
}

export interface FieldSchema {
  fields: FieldDefinition[];
}

export interface BenefitTemplate {
  id: number;
  templateId: string; // UUID
  categoryId: number;
  categoryName: string;
  categoryIcon: string | null;
  type: 'group' | 'individual';
  name: string;
  description: string | null;
  version: string;
  majorVersion: number;
  minorVersion: number;
  fieldSchema: FieldSchema;
  defaultValues: Record<string, unknown>;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// Fetch active individual templates (latest versions only)
export async function fetchIndividualTemplates(): Promise<BenefitTemplate[]> {
  const response = await fetch(
    `${BENEFIT_DESIGNER_URL}/api/templates?type=individual&status=active&latest=true`,
    { cache: 'no-store' }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch templates: ${response.statusText}`);
  }
  return response.json();
}

// Fetch single template by ID
export async function fetchTemplateById(id: number): Promise<BenefitTemplate> {
  const response = await fetch(
    `${BENEFIT_DESIGNER_URL}/api/templates/${id}`,
    { cache: 'no-store' }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch template ${id}: ${response.statusText}`);
  }
  return response.json();
}

// Fetch templates by type
export async function fetchTemplatesByType(type: 'individual' | 'group'): Promise<BenefitTemplate[]> {
  const response = await fetch(
    `${BENEFIT_DESIGNER_URL}/api/templates?type=${type}&status=active&latest=true`,
    { cache: 'no-store' }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} templates: ${response.statusText}`);
  }
  return response.json();
}
