import 'dotenv/config';
import './queue';
import './workers/action-worker';
import { startTriggerChecker } from './trigger-checker';

startTriggerChecker();
