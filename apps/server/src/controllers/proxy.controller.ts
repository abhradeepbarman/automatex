import { connections } from '@repo/db/schema';
import axios from 'axios';
import { and, eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import db from '@repo/db';
import { asyncHandler, CustomErrorHandler, ResponseHandler } from '../utils';

export const proxyRequest = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { url, connectionId } = req.query;

    if (!url || typeof url !== 'string') {
      return next(CustomErrorHandler.badRequest('URL is required'));
    }

    if (!connectionId || typeof connectionId !== 'string') {
      return next(CustomErrorHandler.badRequest('Connection ID is required'));
    }

    const [connection] = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.id, connectionId),
          eq(connections.userId, req.user.id),
        ),
      );

    if (!connection) {
      return next(CustomErrorHandler.notFound('Connection not found'));
    }

    try {
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
        },
      });

      return res.status(200).send(ResponseHandler(200, 'Success', data));
    } catch (error: any) {
      return next(
        CustomErrorHandler.badRequest(
          error.response?.data?.message || 'Failed to fetch options',
        ),
      );
    }
  },
);
