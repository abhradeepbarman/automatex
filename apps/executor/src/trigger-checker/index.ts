import apps from '@repo/common/@apps';
import { StepType, type IApp } from '@repo/common/types';
import db from '@repo/db';
import { connections, workflows } from '@repo/db/schema';
import { eq } from 'drizzle-orm';
import cron from 'node-cron';
import { actionQueue, queueName } from '../queue';
import { getRefreshTokenAndUpdate } from '../utils';

function hasValidAuth(app: IApp, triggerDetails: any): boolean {
  if (!app.auth) {
    return true;
  }

  if (!triggerDetails.connections || !triggerDetails.connections.accessToken) {
    return false;
  }

  if (
    triggerDetails.connections.expiresAt &&
    new Date(triggerDetails.connections.expiresAt) < new Date()
  ) {
    return false;
  }

  return true;
}

export function startTriggerChecker() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      console.log('Checking triggers...');
      const activeWorkflows = await db.query.workflows.findMany({
        where: eq(workflows.isActive, true),
        with: {
          steps: {
            with: {
              connections: true,
            },
          },
        },
      });

      console.log(`Found ${activeWorkflows.length} active workflows`);

      if (!activeWorkflows || activeWorkflows.length === 0) {
        return;
      }

      for (const workflow of activeWorkflows) {
        const triggerDetails = workflow.steps.find((step) => step.index === 0);
        if (!triggerDetails) {
          console.log(`Workflow ${workflow.id} has no trigger step`);
          continue;
        }

        if (triggerDetails.type !== StepType.TRIGGER) {
          console.log(`Workflow ${workflow.id} first step is not a trigger`);
          continue;
        }

        const app = apps.find((app) => app.id === triggerDetails.app);
        if (!app) {
          console.log(
            `App ${triggerDetails.app} not found for workflow ${workflow.id}`,
          );
          continue;
        }

        if (!app.triggers) {
          console.log(`App ${app.id} has no triggers`);
          continue;
        }

        const trigger = app.triggers.find(
          (trigger) =>
            trigger.id === (triggerDetails.metadata as any).data.triggerId,
        );

        if (!trigger) {
          console.log(
            `Trigger ${(triggerDetails.metadata as any).data.triggerId} not found in app ${app.id}`,
          );
          continue;
        }

        if (!hasValidAuth(app, triggerDetails)) {
          console.log(`Workflow ${workflow.id} has invalid auth`);
          continue;
        }

        console.log(
          `Running trigger ${trigger.id} for workflow ${workflow.id}`,
        );
        let { success, message, statusCode } = await trigger.run(
          (triggerDetails.metadata as any).data.fields,
          workflow.lastExecutedAt,
          triggerDetails.connections?.accessToken || '',
        );

        console.log('message', message);

        if (
          !success &&
          statusCode === 401 &&
          app.auth &&
          triggerDetails.connections?.refreshToken &&
          triggerDetails.connectionId
        ) {
          console.log(
            `Token expired for workflow ${workflow.id}, refreshing and retrying...`,
          );
          try {
            await getRefreshTokenAndUpdate(triggerDetails.connectionId, app);

            // Retry with refreshed token
            const updatedConnection = await db.query.connections.findFirst({
              where: eq(connections.id, triggerDetails.connectionId),
            });

            if (updatedConnection?.accessToken) {
              console.log(
                `Retrying trigger ${trigger.id} with refreshed token`,
              );
              const retryResult = await trigger.run(
                (triggerDetails.metadata as any).data.fields,
                workflow.lastExecutedAt,
                updatedConnection.accessToken,
              );
              success = retryResult.success;
              message = retryResult.message;
              statusCode = retryResult.statusCode;
            }
          } catch (refreshError) {
            console.error(
              `Failed to refresh token for workflow ${workflow.id}:`,
              refreshError,
            );
          }
        }

        // Process successful trigger execution
        if (success && statusCode === 200) {
          console.log(
            `Trigger ${trigger.id} ran successfully for workflow ${workflow.id}`,
          );
          await db
            .update(workflows)
            .set({
              lastExecutedAt: new Date(),
            })
            .where(eq(workflows.id, workflow.id));

          const firstActionDetails = workflow.steps.find(
            (step) => step.index === 1,
          );
          if (!firstActionDetails) {
            console.log(
              `Workflow ${workflow.id} has no action step after trigger`,
            );
            continue;
          }

          if (firstActionDetails.type !== StepType.ACTION) {
            console.log(`Workflow ${workflow.id} second step is not an action`);
            continue;
          }

          console.log(
            `Adding action ${firstActionDetails.id} to queue for workflow ${workflow.id}`,
          );

          await actionQueue.add(queueName, {
            stepId: firstActionDetails.id,
          });

          console.log(
            `Action ${firstActionDetails.id} added to queue for workflow ${workflow.id}`,
          );
        } else {
          console.log(
            `Trigger ${trigger.id} failed for workflow ${workflow.id}: ${message}`,
          );
        }
      }
    } catch (error) {
      console.error('Error checking triggers:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
    }
  });

  console.log('Trigger checker cron job started');
}
