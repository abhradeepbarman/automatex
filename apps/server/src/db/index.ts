import { drizzle } from 'drizzle-orm/node-postgres';
import { connections, stepConditions, steps, users, workflows } from './schema';
import config from '../config';

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
