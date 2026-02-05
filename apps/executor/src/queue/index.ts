import { Queue } from 'bullmq';
import config from '../config';

export const queueName = 'action-execution';

export const actionQueue = new Queue(queueName, {
  connection: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  },
});

actionQueue.on('error', (job) => {
  console.log(`Job ${job.name} failed`);
});

console.log('Queue initialized');
