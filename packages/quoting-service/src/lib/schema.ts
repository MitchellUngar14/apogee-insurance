// src/lib/schema.ts
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

// Enum for Quote Status
export const quoteStatusEnum = pgEnum('quote_status', [
  'In Progress',
  'Ready for Sale',
  'Archived',
]);

// Enum for Quote Type
export const quoteTypeEnum = pgEnum('quote_type', ['Individual', 'Group']);

// Enum for Applicant Status
export const applicantStatusEnum = pgEnum('applicant_status', ['Incomplete', 'Complete']);

// --- Tables ---

// Groups Table: Stores information about the company or group.
export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  groupName: varchar('group_name', { length: 256 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Employee Classes Table: Classification tiers for group employees (Manager, Employee, CEO, etc.)
export const employeeClasses = pgTable('employee_classes', {
  id: serial('id').primaryKey(),
  groupId: integer('group_id').references(() => groups.id).notNull(),
  className: varchar('class_name', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Applicants Table: A table for individual applicants and employees.
// Can be linked to a group and a class.
export const applicants = pgTable('applicants', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  middleName: varchar('middle_name', { length: 256 }), // Optional
  lastName: varchar('last_name', { length: 256 }).notNull(),
  birthdate: timestamp('birthdate', { mode: 'date' }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }), // Optional
  email: varchar('email', { length: 256 }), // Optional for group employees
  // Address fields (primarily for Individual applicants)
  addressLine1: varchar('address_line_1', { length: 256 }),
  addressLine2: varchar('address_line_2', { length: 256 }),
  city: varchar('city', { length: 100 }),
  stateProvince: varchar('state_province', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 2 }), // ISO 3166-1 alpha-2 code (US, CA, etc.)
  groupId: integer('group_id').references(() => groups.id),
  classId: integer('class_id').references(() => employeeClasses.id), // Employee class assignment
  quoteType: quoteTypeEnum('quote_type'),
  status: applicantStatusEnum('status').default('Incomplete').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Quotes Table: Stores the core quote information.
export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  status: quoteStatusEnum('status').default('In Progress').notNull(),
  type: quoteTypeEnum('type').notNull(),
  applicantId: integer('applicant_id').references(() => applicants.id),
  groupId: integer('group_id').references(() => groups.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Coverages Table: Stores the specific insurance products selected for a quote.
export const coverages = pgTable('coverages', {
  id: serial('id').primaryKey(),
  quoteId: integer('quote_id')
    .references(() => quotes.id)
    .notNull(),
  productType: varchar('product_type', { length: 100 }).notNull(),
  details: text('details'),
});

// --- Relations ---

export const groupRelations = relations(groups, ({ many }) => ({
  applicants: many(applicants),
  employeeClasses: many(employeeClasses),
  quotes: many(quotes),
}));

export const employeeClassRelations = relations(employeeClasses, ({ one, many }) => ({
  group: one(groups, {
    fields: [employeeClasses.groupId],
    references: [groups.id],
  }),
  applicants: many(applicants),
}));

export const applicantRelations = relations(applicants, ({ one, many }) => ({
  group: one(groups, {
    fields: [applicants.groupId],
    references: [groups.id],
  }),
  employeeClass: one(employeeClasses, {
    fields: [applicants.classId],
    references: [employeeClasses.id],
  }),
  quotes: many(quotes),
}));

export const quoteRelations = relations(quotes, ({ one, many }) => ({
  applicant: one(applicants, {
    fields: [quotes.applicantId],
    references: [applicants.id],
  }),
  group: one(groups, {
    fields: [quotes.groupId],
    references: [groups.id],
  }),
  coverages: many(coverages),
}));

export const coverageRelations = relations(coverages, ({ one }) => ({
  quote: one(quotes, {
    fields: [coverages.quoteId],
    references: [quotes.id],
  }),
}));
