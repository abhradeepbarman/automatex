import { drizzle } from 'drizzle-orm/node-postgres';
import {
  connectionRelations,
  connections,
  runRelations,
  runs,
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
  runs,

  userRelations,
  workflowRelations,
  stepRelations,
  stepConditionsRelations,
  connectionRelations,
  runRelations,
};

const db = drizzle(process.env.DATABASE_URL!, {
  schema,
  logger: true,
});

export default db;
