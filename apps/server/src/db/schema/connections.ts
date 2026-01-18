import { relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { steps } from './steps';
import { workflows } from './workflows';

export const connections = pgTable('connections', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  app: varchar('app').notNull(),
  workflowId: uuid('workflow_id')
    .references(() => workflows.id)
    .notNull(),
  stepId: uuid('step_id')
    .references(() => steps.id)
    .notNull(),
  accessToken: varchar('access_token').notNull(),
  refreshToken: varchar('refresh_token').notNull(),
  accessTokenExpiresAt: timestamp('access_token_expires_at').notNull(),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const connectionRelations = relations(connections, ({ one }) => ({
  workflow: one(workflows, {
    fields: [connections.workflowId],
    references: [workflows.id],
  }),
  step: one(steps, {
    fields: [connections.stepId],
    references: [steps.id],
  }),
}));
