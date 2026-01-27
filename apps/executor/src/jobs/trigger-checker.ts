import { StepType } from '@repo/common/types';
import db from '@repo/db';
import { workflows } from '@repo/db/schema';
import { and, eq } from 'drizzle-orm';
import cron from 'node-cron';

export function startTriggerChecker() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      // 1. Fetch all active workflows with triggers (last executed at + polling time >= current time)
      // 2. For each trigger, check if conditions are met
      // 3. If trigger conditions are met, queue actions for execution

      const activeWorkflows = await db.query.workflows.findMany({
        where: and(eq(workflows.isActive, true)),
        with: {
          steps: true,
        },
      });

      let workflowsToRun = [];
      for (const workflow of activeWorkflows) {
        const trigger = workflow.steps[0];
        if (!trigger || trigger.type !== StepType.TRIGGER) {
          continue;
        }
      }
    } catch (error) {
      console.error('Error checking triggers:', error);
    }
  });

  console.log('Trigger checker cron job started');
}
