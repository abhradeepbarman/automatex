import db from '@repo/db';
import { executionLogs, steps, workflows } from '@repo/db/schema';
import { and, desc, eq, lt } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import { asyncHandler, CustomErrorHandler, ResponseHandler } from '../utils';

export const getWorkflowExecutionLogs = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { workflowId } = req.params;
    const { id: userId } = req.user;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.current as string) || 1;

    const workflow = await db.query.workflows.findFirst({
      where: and(
        eq(workflows.id, workflowId as string),
        eq(workflows.userId, userId),
      ),
    });

    if (!workflow) {
      return next(CustomErrorHandler.notFound('Workflow not found'));
    }

    const totalCountResult = await db
      .select({ value: executionLogs.id })
      .from(executionLogs)
      .where(eq(executionLogs.workflowId, workflowId as string));
    const totalCount = totalCountResult.length;

    const executionLogsResult = await db
      .select({
        id: executionLogs.id,
        step_name: steps.name,
        executed_at: executionLogs.createdAt,
        status: executionLogs.status,
        step_type: steps.type,
      })
      .from(executionLogs)
      .where(eq(executionLogs.workflowId, workflowId as string))
      .limit(limit)
      .offset((offset - 1) * limit)
      .orderBy(desc(executionLogs.createdAt))
      .innerJoin(steps, eq(executionLogs.stepId, steps.id));

    return res.status(200).send(
      ResponseHandler(200, 'Workflow execution logs', {
        executionLogs: executionLogsResult,
        pagination: {
          page: offset,
          limit,
          hasMore: offset * limit < totalCount,
        },
      }),
    );
  },
);
