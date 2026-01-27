import { drizzle } from 'drizzle-orm/node-postgres';
import {
  connectionRelations,
  connections,
  executionRelations,
  executions,
  stepConditions,
  stepConditionsRelations,
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
  stepConditions,
  connections,
  executions,

  userRelations,
  workflowRelations,
  stepRelations,
  stepConditionsRelations,
  connectionRelations,
  executionRelations,
};

const db = drizzle(process.env.DATABASE_URL!, {
  schema,
  logger: true,
});

export default db;
