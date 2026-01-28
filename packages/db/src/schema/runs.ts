import { ExecutionResult, ExecutionStatus } from '@repo/common/types';
import { relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { steps } from './steps';
import { workflows } from './workflows';

export const runs = pgTable('executions', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  workflowId: uuid('workflow_id')
    .notNull()
    .references(() => workflows.id, {
      onDelete: 'cascade',
      onUpdate: 'no action',
    }),
  stepId: uuid('step_id')
    .notNull()
    .references(() => steps.id, {
      onDelete: 'cascade',
      onUpdate: 'no action',
    }),
  result: varchar('result', {
    enum: [ExecutionResult.SUCCESS, ExecutionResult.FAILURE],
  }),
  status: varchar('status', {
    enum: [
      ExecutionStatus.RUNNING,
      ExecutionStatus.COMPLETED,
      ExecutionStatus.PENDING,
    ],
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const runRelations = relations(runs, ({ one }) => ({
  workflow: one(workflows, {
    fields: [runs.workflowId],
    references: [workflows.id],
  }),
  step: one(steps, {
    fields: [runs.stepId],
    references: [steps.id],
  }),
}));
