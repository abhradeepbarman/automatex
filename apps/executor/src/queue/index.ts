import { Queue } from 'bullmq';
import config from '../config';

export const queueName = 'action-execution';

export const actionQueue = new Queue(queueName, {
  connection: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  },
});

actionQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

console.log('Queue initialized');
