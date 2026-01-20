import { relations } from 'drizzle-orm';
import {
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { stepConditions } from './step-conditions';
import { workflows } from './workflows';
import { StepType } from '@repo/common/types';

export const steps = pgTable('steps', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  workflowId: uuid('workflow_id')
    .references(() => workflows.id, {
      onDelete: 'cascade',
      onUpdate: 'no action',
    })
    .notNull(),
  type: varchar('type', {
    enum: [StepType.TRIGGER, StepType.ACTION],
  }).notNull(),
  index: integer('index').notNull(),
  app: varchar('app').notNull(),
  metadata: jsonb('metadata').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const stepRelations = relations(steps, ({ one }) => ({
  workflows: one(workflows, {
    fields: [steps.workflowId],
    references: [workflows.id],
  }),
  stepConditions: one(stepConditions, {
    fields: [steps.id],
    references: [stepConditions.stepId],
  }),
}));
