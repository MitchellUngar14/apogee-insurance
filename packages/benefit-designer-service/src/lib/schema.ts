// packages/benefit-designer-service/src/lib/schema.ts
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  uuid,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Enums ---

// Enum for Template Status
export const templateStatusEnum = pgEnum('template_status', [
  'draft',
  'active',
  'archived',
]);

// Enum for Benefit Type (Group vs Individual)
export const benefitTypeEnum = pgEnum('benefit_type', [
  'group',
  'individual',
]);

// --- Tables ---

// Benefit Categories Table: Stores categories like Health, Dental, Life, Auto, etc.
export const benefitCategories = pgTable('benefit_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }), // For UI display (e.g., emoji or icon name)
  appliesTo: jsonb('applies_to').notNull().default(['group', 'individual']), // Array of benefit types
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Benefit Templates Table: Versioned templates with dynamic field schema
export const benefitTemplates = pgTable('benefit_templates', {
  id: serial('id').primaryKey(),
  templateId: uuid('template_id').notNull(), // Groups all versions together
  categoryId: integer('category_id').references(() => benefitCategories.id).notNull(),
  type: benefitTypeEnum('type').notNull(), // 'group' or 'individual'
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description'),

  // Versioning
  version: varchar('version', { length: 20 }).notNull(), // "1.0", "1.1", "2.0"
  majorVersion: integer('major_version').notNull().default(1),
  minorVersion: integer('minor_version').notNull().default(0),

  // Dynamic field schema stored as JSON
  fieldSchema: jsonb('field_schema').notNull().default({ fields: [] }),
  defaultValues: jsonb('default_values').default({}),

  // Status
  status: templateStatusEnum('status').default('draft').notNull(),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by'), // FK to users table if needed later
});

// --- Relations ---

export const benefitCategoryRelations = relations(benefitCategories, ({ many }) => ({
  templates: many(benefitTemplates),
}));

export const benefitTemplateRelations = relations(benefitTemplates, ({ one }) => ({
  category: one(benefitCategories, {
    fields: [benefitTemplates.categoryId],
    references: [benefitCategories.id],
  }),
}));

// --- Type Definitions for JSON Fields ---

// Field types supported in the schema
export type FieldType =
  | 'money'
  | 'percentage'
  | 'number'
  | 'text'
  | 'textarea'
  | 'date'
  | 'dropdown'
  | 'checkbox';

// Validation rules structure
export interface FieldValidation {
  min?: number;
  max?: number;
  decimals?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minDate?: string; // 'today' or ISO date
  maxDate?: string;
  lessThanField?: string;
  greaterThanField?: string;
  requiredIf?: {
    field: string;
    value: unknown;
  };
  message?: string;
}

// Dropdown option structure
export interface DropdownOption {
  value: string;
  label: string;
}

// Individual field definition
export interface FieldDefinition {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  description?: string;
  placeholder?: string;
  options?: DropdownOption[]; // For dropdown type
  validation?: FieldValidation;
}

// Complete field schema structure
export interface FieldSchema {
  fields: FieldDefinition[];
}

// Type for the benefit_templates table insert/select
export type BenefitCategory = typeof benefitCategories.$inferSelect;
export type NewBenefitCategory = typeof benefitCategories.$inferInsert;
export type BenefitTemplate = typeof benefitTemplates.$inferSelect;
export type NewBenefitTemplate = typeof benefitTemplates.$inferInsert;
