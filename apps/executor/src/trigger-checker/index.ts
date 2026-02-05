import apps from '@repo/common/@apps';
import { ExecutionStatus, StepType } from '@repo/common/types';
import db from '@repo/db';
import { executionLogs, workflows } from '@repo/db/schema';
import { eq } from 'drizzle-orm';
import cron from 'node-cron';
import { actionQueue, queueName } from '../queue';

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
        const triggerDetails = workflow.steps.find((step) => step.index == 0);
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

        if (
          app.auth &&
          (!triggerDetails.connections ||
            !triggerDetails.connections?.accessToken ||
            (triggerDetails.connections?.expiresAt &&
              new Date(triggerDetails.connections?.expiresAt) < new Date()))
        ) {
          console.log(`Workflow ${workflow.id} has valid auth issues`);
          continue;
        }

        console.log(
          `Running trigger ${trigger.id} for workflow ${workflow.id}`,
        );
        const { success, message } = await trigger.run(
          (triggerDetails.metadata as any).data.fields,
          workflow.lastExecutedAt,
          triggerDetails.connections?.accessToken || '',
        );

        if (success) {
          console.log(
            `Trigger ${trigger.id} ran successfully for workflow ${workflow.id}`,
          );
          await db.update(workflows).set({
            lastExecutedAt: new Date(),
          });
          const firstActionDetails = workflow.steps.find(
            (step) => step.index == 1,
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
    }
  });

  console.log('Trigger checker cron job started');
}
