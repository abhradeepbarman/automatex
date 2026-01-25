import { drizzle } from 'drizzle-orm/node-postgres';
import {
  connectionRelations,
  connections,
  stepConditions,
  stepConditionsRelations,
  stepRelations,
  steps,
  userRelations,
  users,
  workflowRelations,
  workflows,
} from './schema';
import config from '../config';

const schema = {
  users,
  workflows,
  steps,
  stepConditions,
  connections,

  userRelations,
  workflowRelations,
  stepRelations,
  stepConditionsRelations,
  connectionRelations,
};

const db = drizzle(config.DATABASE_URL, {
  schema,
  logger: true,
});

export default db;
