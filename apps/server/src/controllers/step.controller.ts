import { ConditionOperator, StepType } from '@repo/common/types';
import { addStepSchema, updateStepSchema } from '@repo/common/validators';
import { and, eq, gte } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import db from '@repo/db';
import { stepConditions, steps, workflows } from '@repo/db/schema';
import { asyncHandler, CustomErrorHandler, ResponseHandler } from '../utils';

export const addStep = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { workflowId } = req.params;
    const body = addStepSchema.parse(req.body);
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
      const { field, operator, value } = metadata.data.fields;
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
          isActive: false,
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

    const body = updateStepSchema.parse(req.body);

    if (Object.keys(body).length === 0) {
      return next(CustomErrorHandler.badRequest('Nothing to update'));
    }

    const step = await db.query.steps.findFirst({
      where: and(
        eq(steps.workflowId, workflowId as string),
        eq(steps.id, stepId as string),
      ),
    });

    if (!step) {
      return next(CustomErrorHandler.notFound('Step not found'));
    }

    const [updatedStep] = await db
      .update(steps)
      .set(body)
      .where(eq(steps.id, stepId as string))
      .returning();

    if (!updatedStep) {
      return next(CustomErrorHandler.serverError());
    }

    if (updatedStep.type === StepType.TRIGGER && body.metadata) {
      const { field, operator, value } = body.metadata.data.fields;
      await db
        .update(stepConditions)
        .set({
          field,
          operator,
          value: value as ConditionOperator,
        })
        .where(eq(stepConditions.stepId, stepId as string));
    }

    return res.status(200).send(
      ResponseHandler(200, 'Step updated successfully', {
        id: updatedStep.id,
      }),
    );
  },
);
