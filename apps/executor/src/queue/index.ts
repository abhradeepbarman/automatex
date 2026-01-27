import { Queue } from 'bullmq';
import config from '../config';

export const actionQueue = new Queue('action-execution', {
  connection: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  },
});

console.log('BullMQ Queue initialized');
