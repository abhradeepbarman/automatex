import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../utils';

export const getAuthUrl = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const handleOAuthCallback = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {},
);
