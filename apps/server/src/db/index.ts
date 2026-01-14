import { drizzle } from 'drizzle-orm/node-postgres';
import config from '../config';
import { stepConditions, steps, users, workflows } from './schema';

const schema = {
  users,
  workflows,
  steps,
  stepConditions,
};

const db = drizzle(config.DATABASE_URL, {
  schema,
  logger: true,
});

export default db;
