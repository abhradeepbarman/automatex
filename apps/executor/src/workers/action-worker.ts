import { Worker, Job } from 'bullmq';
import config from '../config';

interface ActionJobData {
  workflowId: string;
  stepId: string;
  actionType: string;
  actionData: any;
  connectionId?: string;
}

export const actionWorker = new Worker<ActionJobData>(
  'action-execution',
  async (job: Job<ActionJobData>) => {
    const { workflowId, stepId, actionType, actionData, connectionId } =
      job.data;

    console.log(`Processing action: ${actionType} for workflow: ${workflowId}`);

    try {
      //
    } catch (error) {
      console.error(`Error executing action ${actionType}:`, error);
      throw error;
    }
  },
  {
    connection: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
    },
    concurrency: 5,
  },
);

actionWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

actionWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

actionWorker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log('Action Worker started');
