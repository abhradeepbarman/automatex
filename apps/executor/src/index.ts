import 'dotenv/config';
import './queue';
import './workers/action-worker';
import { startTriggerChecker } from './jobs/trigger-checker';

startTriggerChecker();
