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

// Applicants Table: A table for individual applicants and employees.
// Can be linked to a group.
export const applicants = pgTable('applicants', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  middleName: varchar('middle_name', { length: 256 }), // Optional
  lastName: varchar('last_name', { length: 256 }).notNull(),
  birthdate: timestamp('birthdate', { mode: 'date' }).notNull(), // Use mode: 'date' for Date objects
  phoneNumber: varchar('phone_number', { length: 20 }), // Optional
  email: varchar('email', { length: 256 }).unique().notNull(),
  groupId: integer('group_id').references(() => groups.id), // Foreign key to groups table
  quoteType: quoteTypeEnum('quote_type'), // 'Individual' or 'Group'
  status: applicantStatusEnum('status').default('Incomplete').notNull(), // New status field
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Quotes Table: Stores the core quote information.
export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  status: quoteStatusEnum('status').default('In Progress').notNull(),
  type: quoteTypeEnum('type').notNull(),
  applicantId: integer('applicant_id').references(() => applicants.id), // For individual quotes
  groupId: integer('group_id').references(() => groups.id), // For group quotes
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Coverages Table: Stores the specific insurance products selected for a quote.
export const coverages = pgTable('coverages', {
  id: serial('id').primaryKey(),
  quoteId: integer('quote_id')
    .references(() => quotes.id)
    .notNull(),
  productType: varchar('product_type', { length: 100 }).notNull(), // e.g., 'Health', 'Dental', 'Auto'
  details: text('details'), // Could be a JSONB field in a real scenario for more complex data
});

// --- Relations ---

export const groupRelations = relations(groups, ({ many }) => ({
  applicants: many(applicants),
  quotes: many(quotes),
}));

export const applicantRelations = relations(applicants, ({ one, many }) => ({
  group: one(groups, {
    fields: [applicants.groupId],
    references: [groups.id],
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
