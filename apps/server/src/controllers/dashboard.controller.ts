import db from '@repo/db';
import { runs, workflows } from '@repo/db/schema';
import { and, eq, gt, sql } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import { asyncHandler, ResponseHandler } from '../utils';
import { ExecutionResult } from '@repo/common/types';

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get total workflows
    const workflowsCount = await db.$count(
      workflows,
      and(eq(workflows.userId, userId), gt(workflows.createdAt, thirtyDaysAgo)),
    );

    // Get total runs in last 30 days
    const runsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(runs)
      .innerJoin(workflows, eq(runs.workflowId, workflows.id))
      .where(
        and(eq(workflows.userId, userId), gt(runs.createdAt, thirtyDaysAgo)),
      );

    // Get total errors
    const errorsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(runs)
      .innerJoin(workflows, eq(runs.workflowId, workflows.id))
      .where(
        and(
          eq(workflows.userId, userId),
          gt(runs.createdAt, thirtyDaysAgo),
          eq(runs.result, ExecutionResult.FAILURE),
        ),
      );

    return res.status(200).send(
      ResponseHandler(200, 'Dashboard stats fetched successfully', {
        totalWorkflows: Number(workflowsCount || 0),
        totalRuns: Number(runsCount || 0),
        totalErrors: Number(errorsCount || 0),
      }),
    );
  },
);
