import apps from '@repo/common/@apps';
import { ExecutionStatus, StepType } from '@repo/common/types';
import db from '@repo/db';
import { connections, executionLogs, steps } from '@repo/db/schema';
import { Job, Worker } from 'bullmq';
import { and, eq } from 'drizzle-orm';
import config from '../config';
import { actionQueue, queueName } from '../queue';
import { getRefreshTokenAndUpdate } from '../utils';

interface ActionJobData {
  stepId: string;
  jobId: string;
}

export const actionWorker = new Worker<ActionJobData>(
  queueName,
  async (job: Job<ActionJobData>) => {
    try {
      console.log('Action worker started for job:', job.id);
      const { stepId, jobId } = job.data;
      console.log(`Processing step ${stepId}`);

      const stepDetails = await db.query.steps.findFirst({
        where: eq(steps.id, stepId),
        with: {
          workflows: true,
          connections: true,
        },
      });

      if (!stepDetails?.workflows) {
        console.log(`Step ${stepId} or workflow not found`);
        return;
      }

      const app = apps.find((app) => app.id === stepDetails.app);
      const actionId = (stepDetails.metadata as any)?.data?.actionId;
      const actionDetails = app?.actions?.find(
        (action) => action.id === actionId,
      );

      const [executionLog] = await db
        .insert(executionLogs)
        .values({
          workflowId: stepDetails.workflows.id,
          stepId: stepId,
          jobId: jobId,
          message: `Action ${actionDetails?.name || actionId || 'unknown'} execution started`,
          status: ExecutionStatus.RUNNING,
        })
        .returning();

      if (!executionLog) {
        console.log(`Failed to create execution log for step ${stepId}`);
        return;
      }

      if (stepDetails.type !== StepType.ACTION) {
        console.log(`Step ${stepId} is not an action`);
        await db
          .update(executionLogs)
          .set({
            status: ExecutionStatus.FAILED,
            message: `Step is not an action (type: ${stepDetails.type})`,
          })
          .where(eq(executionLogs.id, executionLog.id));
        return;
      }

      const workflowDetails = stepDetails.workflows;

      const { appId, fields } = (stepDetails.metadata as any).data;

      console.log(
        `Executing action ${actionId} for app ${appId} in workflow ${workflowDetails.id}`,
      );

      if (!actionId) {
        console.log('Action ID not found in step metadata');
        await db
          .update(executionLogs)
          .set({
            status: ExecutionStatus.FAILED,
            message: 'Action ID not found in step metadata',
          })
          .where(eq(executionLogs.id, executionLog.id));
        return;
      }

      if (!actionDetails) {
        console.log(`Action ${actionId} not found in app ${appId}`);
        await db
          .update(executionLogs)
          .set({
            status: ExecutionStatus.FAILED,
            message: `Action ${actionId} not found in app ${appId}`,
          })
          .where(eq(executionLogs.id, executionLog.id));
        return;
      }

      if (!app) {
        console.log(`App ${appId} not found`);
        await db
          .update(executionLogs)
          .set({
            status: ExecutionStatus.FAILED,
            message: `App ${appId} not found`,
          })
          .where(eq(executionLogs.id, executionLog.id));
        return;
      }

      let { success, message, statusCode } = await actionDetails.run(
        fields,
        stepDetails.connections?.accessToken,
      );

      console.log('message--', statusCode);

      // Handle token expiration and retry
      if (
        !success &&
        statusCode === 401 &&
        app.auth &&
        stepDetails.connectionId &&
        stepDetails.connections?.refreshToken
      ) {
        console.log(
          `Token expired for step ${stepId}, refreshing and retrying...`,
        );
        try {
          await getRefreshTokenAndUpdate(stepDetails.connectionId, app);

          // Retry with refreshed token
          const updatedConnection = await db.query.connections.findFirst({
            where: eq(connections.id, stepDetails.connectionId),
          });

          if (updatedConnection?.accessToken) {
            console.log(`Retrying action ${actionId} with refreshed token`);
            const retryResult = await actionDetails.run(
              fields,
              updatedConnection.accessToken,
            );
            success = retryResult.success;
            message = retryResult.message;
            statusCode = retryResult.statusCode;
          }
        } catch (refreshError) {
          console.error(
            `Failed to refresh token for step ${stepId}:`,
            refreshError,
          );
        }
      }

      if (!success) {
        console.log(`Action ${actionId} failed for step ${stepId}: ${message}`);
        await db
          .update(executionLogs)
          .set({
            status: ExecutionStatus.FAILED,
            message: message || `Action ${actionDetails.name} failed`,
          })
          .where(eq(executionLogs.id, executionLog.id));
        return;
      }

      console.log(
        `Action ${actionId} completed successfully for step ${stepId}`,
      );

      await db
        .update(executionLogs)
        .set({
          status: ExecutionStatus.COMPLETED,
          message:
            message || `Action ${actionDetails.name} completed successfully`,
        })
        .where(eq(executionLogs.id, executionLog.id));

      const nextStepDetails = await db.query.steps.findFirst({
        where: and(
          eq(steps.workflowId, workflowDetails.id),
          eq(steps.index, stepDetails.index + 1),
        ),
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
        jobId: job.data.jobId,
      });
    } catch (error) {
      console.error('Action failed with error:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
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
