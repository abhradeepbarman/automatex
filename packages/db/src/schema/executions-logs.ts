import { uuid } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { workflows } from './workflows';
import { timestamp } from 'drizzle-orm/pg-core';
import { steps } from './steps';
import { varchar } from 'drizzle-orm/pg-core';
import { ExecutionStatus } from '@repo/common/types';
import { relations } from 'drizzle-orm';

export const executionLogs = pgTable('execution_logs', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id')
    .notNull()
    .references(() => workflows.id),
  stepId: uuid('step_id')
    .notNull()
    .references(() => steps.id),
  jobId: varchar('job_id').notNull(),
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
