// Customer Service Schema - Separated Individual and Group Policies
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Enums ---

export const policyStatusEnum = pgEnum('policy_status', ['Active', 'Cancelled', 'Expired']);

export const dependentTypeEnum = pgEnum('dependent_type', ['Spouse', 'Child', 'Domestic Partner', 'Other']);

// =============================================================================
// INDIVIDUAL POLICIES
// =============================================================================

// Individual Policies Table
export const individualPolicies = pgTable('individual_policies', {
  id: serial('id').primaryKey(),
  policyNumber: varchar('policy_number', { length: 50 }).unique().notNull(),
  sourceQuoteId: integer('source_quote_id').notNull(),
  status: policyStatusEnum('status').default('Active').notNull(),
  effectiveDate: timestamp('effective_date', { mode: 'date' }).notNull(),
  expirationDate: timestamp('expiration_date', { mode: 'date' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Policy Holders Table (1:1 with individual policy)
export const policyHolders = pgTable('policy_holders', {
  id: serial('id').primaryKey(),
  policyId: integer('policy_id').references(() => individualPolicies.id).notNull().unique(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  middleName: varchar('middle_name', { length: 256 }),
  lastName: varchar('last_name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  birthdate: timestamp('birthdate', { mode: 'date' }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  sourceApplicantId: integer('source_applicant_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Dependents Table (spouse, children - can have optional coverages)
export const dependents = pgTable('dependents', {
  id: serial('id').primaryKey(),
  policyHolderId: integer('policy_holder_id').references(() => policyHolders.id).notNull(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  middleName: varchar('middle_name', { length: 256 }),
  lastName: varchar('last_name', { length: 256 }).notNull(),
  birthdate: timestamp('birthdate', { mode: 'date' }),
  dependentType: dependentTypeEnum('dependent_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Beneficiaries Table (benefit recipients - no coverages)
export const beneficiaries = pgTable('beneficiaries', {
  id: serial('id').primaryKey(),
  policyHolderId: integer('policy_holder_id').references(() => policyHolders.id).notNull(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  middleName: varchar('middle_name', { length: 256 }),
  lastName: varchar('last_name', { length: 256 }).notNull(),
  relationship: varchar('relationship', { length: 100 }),
  percentage: integer('percentage'), // Percentage of benefit allocation
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Individual Policy Coverages (for the policy holder)
export const individualPolicyCoverages = pgTable('individual_policy_coverages', {
  id: serial('id').primaryKey(),
  policyId: integer('policy_id').references(() => individualPolicies.id).notNull(),
  productType: varchar('product_type', { length: 100 }).notNull(),
  details: text('details'),
  premium: varchar('premium', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Dependent Coverages (optional coverages for dependents like spouse)
export const dependentCoverages = pgTable('dependent_coverages', {
  id: serial('id').primaryKey(),
  dependentId: integer('dependent_id').references(() => dependents.id).notNull(),
  productType: varchar('product_type', { length: 100 }).notNull(),
  details: text('details'),
  premium: varchar('premium', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// =============================================================================
// GROUP POLICIES
// =============================================================================

// Group Policies Table
export const groupPolicies = pgTable('group_policies', {
  id: serial('id').primaryKey(),
  policyNumber: varchar('policy_number', { length: 50 }).unique().notNull(),
  sourceQuoteId: integer('source_quote_id').notNull(),
  sourceGroupId: integer('source_group_id'),
  groupName: varchar('group_name', { length: 256 }).notNull(),
  status: policyStatusEnum('status').default('Active').notNull(),
  effectiveDate: timestamp('effective_date', { mode: 'date' }).notNull(),
  expirationDate: timestamp('expiration_date', { mode: 'date' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Policy Classes Table (Manager, Employee, CEO, etc.)
export const policyClasses = pgTable('policy_classes', {
  id: serial('id').primaryKey(),
  groupPolicyId: integer('group_policy_id').references(() => groupPolicies.id).notNull(),
  className: varchar('class_name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Group Members Table (employees assigned to one class)
export const groupMembers = pgTable('group_members', {
  id: serial('id').primaryKey(),
  classId: integer('class_id').references(() => policyClasses.id).notNull(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  middleName: varchar('middle_name', { length: 256 }),
  lastName: varchar('last_name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  birthdate: timestamp('birthdate', { mode: 'date' }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  sourceApplicantId: integer('source_applicant_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Class Coverages Table (coverages assigned to each class)
export const classCoverages = pgTable('class_coverages', {
  id: serial('id').primaryKey(),
  classId: integer('class_id').references(() => policyClasses.id).notNull(),
  productType: varchar('product_type', { length: 100 }).notNull(),
  details: text('details'),
  premium: varchar('premium', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// =============================================================================
// RELATIONS - Individual Policies
// =============================================================================

export const individualPolicyRelations = relations(individualPolicies, ({ one, many }) => ({
  policyHolder: one(policyHolders, {
    fields: [individualPolicies.id],
    references: [policyHolders.policyId],
  }),
  coverages: many(individualPolicyCoverages),
}));

export const policyHolderRelations = relations(policyHolders, ({ one, many }) => ({
  policy: one(individualPolicies, {
    fields: [policyHolders.policyId],
    references: [individualPolicies.id],
  }),
  dependents: many(dependents),
  beneficiaries: many(beneficiaries),
}));

export const dependentRelations = relations(dependents, ({ one, many }) => ({
  policyHolder: one(policyHolders, {
    fields: [dependents.policyHolderId],
    references: [policyHolders.id],
  }),
  coverages: many(dependentCoverages),
}));

export const beneficiaryRelations = relations(beneficiaries, ({ one }) => ({
  policyHolder: one(policyHolders, {
    fields: [beneficiaries.policyHolderId],
    references: [policyHolders.id],
  }),
}));

export const individualPolicyCoverageRelations = relations(individualPolicyCoverages, ({ one }) => ({
  policy: one(individualPolicies, {
    fields: [individualPolicyCoverages.policyId],
    references: [individualPolicies.id],
  }),
}));

export const dependentCoverageRelations = relations(dependentCoverages, ({ one }) => ({
  dependent: one(dependents, {
    fields: [dependentCoverages.dependentId],
    references: [dependents.id],
  }),
}));

// =============================================================================
// RELATIONS - Group Policies
// =============================================================================

export const groupPolicyRelations = relations(groupPolicies, ({ many }) => ({
  classes: many(policyClasses),
}));

export const policyClassRelations = relations(policyClasses, ({ one, many }) => ({
  groupPolicy: one(groupPolicies, {
    fields: [policyClasses.groupPolicyId],
    references: [groupPolicies.id],
  }),
  members: many(groupMembers),
  coverages: many(classCoverages),
}));

export const groupMemberRelations = relations(groupMembers, ({ one }) => ({
  class: one(policyClasses, {
    fields: [groupMembers.classId],
    references: [policyClasses.id],
  }),
}));

export const classCoverageRelations = relations(classCoverages, ({ one }) => ({
  class: one(policyClasses, {
    fields: [classCoverages.classId],
    references: [policyClasses.id],
  }),
}));
