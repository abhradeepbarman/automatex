import { ExecutionStatus } from '@repo/common/types';
import { relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { steps } from './steps';
import { workflows } from './workflows';

export const executionLogs = pgTable('execution_logs', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id')
    .notNull()
    .references(() => workflows.id),
  stepId: uuid('step_id')
    .notNull()
    .references(() => steps.id),
  jobId: varchar('job_id').notNull(),
  message: varchar('message').notNull(),
  status: varchar('status', {
    enum: [
      ExecutionStatus.PENDING,
      ExecutionStatus.RUNNING,
      ExecutionStatus.COMPLETED,
      ExecutionStatus.FAILED,
    ],
  })
    .notNull()
    .default(ExecutionStatus.PENDING),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const executionLogRelations = relations(executionLogs, ({ one }) => ({
  workflow: one(workflows, {
    fields: [executionLogs.workflowId],
    references: [workflows.id],
  }),
  step: one(steps, {
    fields: [executionLogs.stepId],
    references: [steps.id],
  }),
}));
