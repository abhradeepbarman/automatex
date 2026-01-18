import { drizzle } from 'drizzle-orm/node-postgres';
import config from '@repo/server-common/config';
import { connections, stepConditions, steps, users, workflows } from './schema';

const schema = {
  users,
  workflows,
  steps,
  stepConditions,
  connections,
};

const db = drizzle(config.DATABASE_URL, {
  schema,
  logger: true,
});

export default db;
