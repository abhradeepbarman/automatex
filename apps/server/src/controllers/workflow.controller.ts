import { and, eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import db from '../db';
import { steps, workflows } from '../db/schema';
import { asyncHandler, CustomErrorHandler, ResponseHandler } from '../utils';

export const createWorkflow = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const { id } = req.user;

    const [newWorkflow] = await db
      .insert(workflows)
      .values({
        name: body?.name,
        userId: id,
      })
      .returning();

    if (!newWorkflow) {
      return next(CustomErrorHandler.serverError());
    }

    return res
      .status(201)
      .send(ResponseHandler(201, 'Workflow created', newWorkflow));
  },
);

export const updateWorkflow = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { id: userId } = req.user;
    const { name, status } = req.body;

    if (!name && !status) {
      return next(CustomErrorHandler.badRequest());
    }

    const workflowDetails = await db.query.workflows.findFirst({
      where: and(eq(workflows.id, id as string), eq(workflows.userId, userId)),
    });

    if (!workflowDetails) {
      return next(CustomErrorHandler.notFound('Workflow not found'));
    }

    if (workflowDetails.userId !== userId) {
      return next(CustomErrorHandler.notAllowed());
    }

    const [updatedWorkflow] = await db
      .update(workflows)
      .set({
        name: name ?? workflowDetails.name,
        status: status ?? workflowDetails.status,
        updatedAt: new Date(),
      })
      .where(eq(workflows.id, id as string))
      .returning();

    return res
      .status(200)
      .send(ResponseHandler(200, 'Workflow updated', updatedWorkflow));
  },
);

export const deleteWorkflow = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { id: userId } = req.user;

    const workflowDetails = await db.query.workflows.findFirst({
      where: and(eq(workflows.id, id as string), eq(workflows.userId, userId)),
    });

    if (!workflowDetails) {
      return next(CustomErrorHandler.notFound('Workflow not found'));
    }

    if (workflowDetails.userId !== userId) {
      return next(CustomErrorHandler.notAllowed());
    }

    const [deletedWorkflow] = await db
      .delete(workflows)
      .where(eq(workflows.id, id as string))
      .returning();

    return res
      .status(200)
      .send(ResponseHandler(200, 'Workflow deleted', deletedWorkflow));
  },
);

export const getWorkflow = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { id: userId } = req.user;

    const workflowDetails = await db.query.workflows.findFirst({
      where: and(eq(workflows.id, id as string), eq(workflows.userId, userId)),
      with: {
        steps: {
          orderBy: (steps, { asc }) => [asc(steps.index)],
        },
      },
    });

    if (!workflowDetails) {
      return next(CustomErrorHandler.notFound('Workflow not found'));
    }

    if (workflowDetails.userId !== userId) {
      return next(CustomErrorHandler.notAllowed());
    }

    return res
      .status(200)
      .send(ResponseHandler(200, 'Workflow details', workflowDetails));
  },
);

export const getAllWorkflows = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: userId } = req.user;

    const workflowsDetails = await db.query.workflows.findMany({
      where: eq(workflows.userId, userId),
    });

    if (!workflowsDetails) {
      return next(CustomErrorHandler.notFound('Workflows not found'));
    }

    return res
      .status(200)
      .send(ResponseHandler(200, 'Workflows details', workflowsDetails));
  },
);
