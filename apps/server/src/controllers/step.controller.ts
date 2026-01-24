import {
  ConditionOperator,
  ITriggerMetadata,
  StepType,
  WorkflowStatus,
} from '@repo/common/types';
import { and, eq, gte } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import z from 'zod';
import db from '../db';
import { stepConditions, steps, workflows } from '../db/schema';
import { asyncHandler, CustomErrorHandler, ResponseHandler } from '../utils';

const stepSchema = z
  .object({
    app: z.string(),
    metadata: z.any(),
    index: z.number(),
    connectionId: z.string(),
    type: z.enum([StepType.TRIGGER, StepType.ACTION]),
  })
  .refine((data) => data.index == 0 && data.type == StepType.ACTION, {
    message: 'First step must be an trigger step',
  })
  .refine((data) => data.index > 0 && data.type == StepType.TRIGGER, {
    message: 'Steps after the first step must be action steps',
  });

export const addStep = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { workflowId } = req.params;
    const body = stepSchema.parse(req.body);
    const { app, metadata, index, type, connectionId } = body;

    const [newStep] = await db
      .insert(steps)
      .values({
        workflowId: workflowId as string,
        app,
        metadata,
        index: index,
        type,
        connectionId,
      })
      .returning();

    if (!newStep) {
      return next(CustomErrorHandler.serverError());
    }

    if (type == StepType.TRIGGER) {
      const { field, operator, value } = (metadata as ITriggerMetadata).fields;
      await db.insert(stepConditions).values({
        stepId: newStep.id,
        field,
        operator,
        value: value as ConditionOperator,
      });
    }

    return res.status(201).send(ResponseHandler(201, 'Step added', newStep));
  },
);

export const getAllSteps = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { workflowId } = req.params;

    const stepsDetails = await db.query.steps.findMany({
      where: eq(steps.workflowId, workflowId as string),
      with: {
        stepConditions: true,
      },
    });

    return res
      .status(200)
      .send(ResponseHandler(200, 'Steps fetched successfully', stepsDetails));
  },
);

export const getStep = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { workflowId, stepId } = req.params;

    const stepDetails = await db.query.steps.findFirst({
      where: eq(steps.workflowId, workflowId as string),
      with: {
        stepConditions: true,
      },
    });

    if (!stepDetails) {
      return next(CustomErrorHandler.notFound('Step not found'));
    }

    return res
      .status(200)
      .send(ResponseHandler(200, 'Step fetched successfully', stepDetails));
  },
);

export const deleteStep = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { workflowId, stepId } = req.params;

    const stepDetails = await db.query.steps.findFirst({
      where: and(
        eq(steps.workflowId, workflowId as string),
        eq(steps.id, stepId as string),
      ),
    });

    if (!stepDetails) {
      return next(CustomErrorHandler.notFound('Step not found'));
    }

    const stepIndex = stepDetails.index;

    await db
      .delete(steps)
      .where(
        and(
          eq(steps.workflowId, workflowId as string),
          gte(steps.index, stepIndex),
        ),
      );

    if (stepIndex <= 1) {
      await db
        .update(workflows)
        .set({
          status: WorkflowStatus.INACTIVE,
        })
        .where(eq(workflows.id, workflowId as string));
    }

    return res
      .status(200)
      .send(ResponseHandler(200, 'Step deleted successfully', stepDetails));
  },
);

export const updateStep = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { workflowId, stepId } = req.params;
    const body = stepSchema.parse(req.body);
    const { app, metadata, index, type, connectionId } = body;

    const stepDetails = await db.query.steps.findFirst({
      where: and(
        eq(steps.workflowId, workflowId as string),
        eq(steps.id, stepId as string),
      ),
    });

    if (!stepDetails) {
      return next(CustomErrorHandler.notFound('Step not found'));
    }

    const [updatedStep] = await db
      .update(steps)
      .set({
        app,
        metadata,
        index,
        type,
        connectionId,
      })
      .where(eq(steps.id, stepId as string))
      .returning();

    if (type == StepType.TRIGGER) {
      const { field, operator, value } = (metadata as ITriggerMetadata).fields;
      await db
        .update(stepConditions)
        .set({
          field,
          operator,
          value: value as ConditionOperator,
        })
        .where(eq(stepConditions.stepId, stepId as string));
    }

    return res
      .status(200)
      .send(ResponseHandler(200, 'Step updated successfully', updatedStep));
  },
);
