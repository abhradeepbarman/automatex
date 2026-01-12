import { NextFunction, Request, Response } from 'express';
import asyncHandler from '../utils/async-handler';
import CustomErrorHandler from '../utils/custom-error-handler';
import db from '../db';
import { registerSchema } from '@repo/common/validators';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';
import ResponseHandler from '../utils/response-handler';

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, config.ACCESS_SECRET, {
    expiresIn: '1h',
  });
  const refreshToken = jwt.sign({ id: userId }, config.REFRESH_SECRET, {
    expiresIn: '7d',
  });
  return { accessToken, refreshToken };
};

export const setCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
  });
};

export const userRegister = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = registerSchema.parse(req.body);
    const { name, email, password } = body;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return next(CustomErrorHandler.alreadyExist('User already exists'));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning();

    if (!newUser) return next(CustomErrorHandler.serverError());

    const { accessToken, refreshToken } = generateTokens(newUser.id);
    setCookies(res, accessToken, refreshToken);

    await db
      .update(users)
      .set({ refreshToken: refreshToken })
      .where(eq(users.id, newUser.id));

    return res.status(201).send(
      ResponseHandler(201, 'User registered successfully', {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        accessToken,
      }),
    );
  },
);
