import { relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { steps } from './steps';
import { users } from './users';
import { WorkflowStatus } from '@repo/common/types';

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  name: varchar('name').default('Untitled workflow').notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  status: varchar('status', {
    enum: [WorkflowStatus.ACTIVE, WorkflowStatus.INACTIVE],
  })
    .default(WorkflowStatus.INACTIVE)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const workflowRelations = relations(workflows, ({ one, many }) => ({
  user: one(users, {
    fields: [workflows.userId],
    references: [users.id],
  }),
  steps: many(steps),
  connections: many(steps),
}));
