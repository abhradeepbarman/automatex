import { Worker, Job } from 'bullmq';
import config from '../config';
import { actionQueue, queueName } from '../queue';
import db from '@repo/db';
import { eq } from 'drizzle-orm';
import { steps } from '@repo/db/schema';
import { StepType } from '@repo/common/types';
import apps from '@repo/common/@apps';

interface ActionJobData {
  stepId: string;
}

export const actionWorker = new Worker<ActionJobData>(
  queueName,
  async (job: Job<ActionJobData>) => {
    try {
      console.log('Action worker started for job:', job.id);
      const { stepId } = job.data;
      console.log(`Processing step ${stepId}`);

      const stepDetails = await db.query.steps.findFirst({
        where: eq(steps.id, stepId),
        with: {
          workflows: true,
          connections: true,
        },
      });

      if (!stepDetails) {
        console.log(`Step ${stepId} not found`);
        return;
      }

      if (stepDetails.type !== StepType.ACTION) {
        console.log(`Step ${stepId} is not an action`);
        return;
      }

      const workflowDetails = stepDetails.workflows;
      if (!workflowDetails) {
        console.log(`Workflow not found for step ${stepId}`);
        return;
      }

      const { actionId, appId, index, fields } = (stepDetails.metadata as any)
        .data;

      console.log(
        `Executing action ${actionId} for app ${appId} in workflow ${workflowDetails.id}`,
      );

      if (!actionId) {
        console.log('Action ID not found in step metadata');
        return;
      }

      const actionDetails = apps
        .find((app) => app.id === appId)
        ?.actions?.find((action) => action.id === actionId);
      if (!actionDetails) {
        console.log(`Action ${actionId} not found in app ${appId}`);
        return;
      }

      const { success } = await actionDetails.run(
        fields,
        stepDetails.connections?.accessToken,
      );

      if (!success) {
        console.log(`Action ${actionId} failed for step ${stepId}`);
        return;
      }

      console.log(
        `Action ${actionId} completed successfully for step ${stepId}`,
      );

      const nextStepDetails = await db.query.steps.findFirst({
        where: eq(steps.index, stepDetails.index + 1),
      });

      if (!nextStepDetails) {
        console.log(
          `No next step found after step ${stepId} (index ${stepDetails.index})`,
        );
        return;
      }

      console.log(`Queueing next step ${nextStepDetails.id}`);
      await actionQueue.add('action', {
        stepId: nextStepDetails.id,
      });
    } catch (error) {
      console.error('Action failed with error:', error);
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
