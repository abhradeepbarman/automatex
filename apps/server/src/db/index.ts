import { drizzle } from 'drizzle-orm/node-postgres';
import config from '../config';
import { users } from './schema';

const schema = {
  users,
};

const db = drizzle(config.DATABASE_URL, {
  schema,
  logger: true,
});

export default db;
