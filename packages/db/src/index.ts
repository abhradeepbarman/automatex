import { drizzle } from 'drizzle-orm/node-postgres';
import {
  connectionRelations,
  connections,
  executionLogRelations,
  executionLogs,
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
  executionLogs,

  userRelations,
  workflowRelations,
  stepRelations,
  connectionRelations,
  executionLogRelations,
};

const db = drizzle(process.env.DATABASE_URL!, { schema, logger: true });

export default db;
