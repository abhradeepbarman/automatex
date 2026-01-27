import { relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { steps } from './steps';
import { ConditionOperator } from '@repo/common/types';

export const stepConditions = pgTable('step_conditions', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  stepId: uuid('step_id')
    .references(() => steps.id, {
      onDelete: 'cascade',
      onUpdate: 'no action',
    })
    .notNull()
    .unique(),
  field: varchar('field').notNull(),
  operator: varchar('operator', {
    enum: [
      ConditionOperator.EQUAL,
      ConditionOperator.NOT_EQUAL,
      ConditionOperator.CONTAINS,
    ],
  }).notNull(),
  value: varchar('value').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const stepConditionsRelations = relations(stepConditions, ({ one }) => ({
  step: one(steps, {
    fields: [stepConditions.stepId],
    references: [steps.id],
  }),
}));
