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
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum for Plan Status
export const planStatusEnum = pgEnum('plan_status', [
  'Draft',
  'Active',
  'Archived',
]);

// Enum for Benefit Category
export const benefitCategoryEnum = pgEnum('benefit_category', [
    'Medical',
    'Dental',
    'Vision',
    'Life',
    'Disability',
]);

// --- Tables ---

// Plans Table: Stores the overall benefit plan structure.
export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  planName: varchar('plan_name', { length: 256 }).notNull(),
  status: planStatusEnum('status').default('Draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Benefit Options Table: Stores different options for benefits.
export const benefitOptions = pgTable('benefit_options', {
  id: serial('id').primaryKey(),
  optionName: varchar('option_name', { length: 256 }).notNull(),
  description: text('description'),
  category: benefitCategoryEnum('category').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Plan Benefits Table: A join table to associate benefits with plans.
export const planBenefits = pgTable('plan_benefits', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').references(() => plans.id).notNull(),
  benefitOptionId: integer('benefit_option_id').references(() => benefitOptions.id).notNull(),
  isIncluded: boolean('is_included').default(true).notNull(),
});


// --- Relations ---

export const planRelations = relations(plans, ({ many }) => ({
  planBenefits: many(planBenefits),
}));

export const benefitOptionRelations = relations(benefitOptions, ({ many }) => ({
    planBenefits: many(planBenefits),
}));

export const planBenefitRelations = relations(planBenefits, ({ one }) => ({
  plan: one(plans, {
    fields: [planBenefits.planId],
    references: [plans.id],
  }),
  benefitOption: one(benefitOptions, {
    fields: [planBenefits.benefitOptionId],
    references: [benefitOptions.id],
  }),
}));