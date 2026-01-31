import { drizzle } from 'drizzle-orm/node-postgres';
import {
  connectionRelations,
  connections,
  runRelations,
  runs,
  stepRelations,
  steps,
  userRelations,
  users,
  workflowRelations,
  workflows,
} from './schema';

const schema = {
  users,
  workflows,
  steps,
  connections,
  runs,

  userRelations,
  workflowRelations,
  stepRelations,
  connectionRelations,
  runRelations,
};

const db = drizzle(process.env.DATABASE_URL!, {
  schema,
  logger: true,
});

export default db;
