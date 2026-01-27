import { ExecutionResult, ExecutionStatus } from '@repo/common/types';
import { relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { steps } from './steps';
import { workflows } from './workflows';

export const executions = pgTable('executions', {
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

export const executionRelations = relations(executions, ({ one }) => ({
  workflow: one(workflows, {
    fields: [executions.workflowId],
    references: [workflows.id],
  }),
  step: one(steps, {
    fields: [executions.stepId],
    references: [steps.id],
  }),
}));
