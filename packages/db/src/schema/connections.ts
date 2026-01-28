import { relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { steps } from './steps';
import { users } from './users';

export const connections = pgTable('connections', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  app: varchar('app').notNull(),
  stepType: varchar('step_type').notNull(),
  connectionName: varchar('connection_name'),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'no action',
    }),
  accessToken: varchar('access_token').notNull(),
  refreshToken: varchar('refresh_token'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const connectionRelations = relations(connections, ({ one, many }) => ({
  user: one(users, {
    fields: [connections.userId],
    references: [users.id],
  }),
  steps: many(steps),
}));
