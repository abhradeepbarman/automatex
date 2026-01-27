import apps from '@repo/common/@apps';
import { NextFunction, Request, Response } from 'express';
import { asyncHandler, CustomErrorHandler, ResponseHandler } from '../utils';
import axios from 'axios';
import db from '@repo/db';
import { connections } from '@repo/db/schema';

export const getAuthUrl = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { provider } = req.params;
    if (!provider) {
      return next(CustomErrorHandler.badRequest('Provider is required'));
    }

    const appDetails = apps.find((app) => app.id === provider);
    if (!appDetails) {
      return next(CustomErrorHandler.badRequest('Invalid provider'));
    }

    const authUrl = appDetails.getAuthUrl();
    if (!authUrl) {
      return next(CustomErrorHandler.badRequest('Invalid provider'));
    }

    return res
      .status(200)
      .send(ResponseHandler(200, 'Auth URL fetched successfully', { authUrl }));
  },
);

export const handleOAuthCallback = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { provider } = req.params;
    if (!provider) {
      return res.send(renderErrorPage('Provider is required'));
    }

    const appDetails = apps.find((app) => app.id === provider);
    if (!appDetails) {
      return res.send(renderErrorPage('Invalid provider'));
    }

    const code = req.query.code as string;
    if (!code) {
      return res.send(renderErrorPage('Code is required'));
    }

    res.send(renderSucessPage(code, 'Success'));
  },
);

export const getTokenUrl = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    if (!code) {
      return next(CustomErrorHandler.badRequest('Code is required'));
    }

    const { provider } = req.params;
    if (!provider) {
      return next(CustomErrorHandler.badRequest('Provider is required'));
    }

    const appDetails = apps.find((app) => app.id === provider);
    if (!appDetails) {
      return next(CustomErrorHandler.badRequest('Invalid provider'));
    }

    const tokenUrl = appDetails.getTokenUrl(code);
    if (!tokenUrl) {
      return next(CustomErrorHandler.badRequest('Invalid provider'));
    }

    const { data } = await axios.post(tokenUrl);
    const { access_token, refresh_token, expires_in } = data;

    if (!access_token) {
      return next(CustomErrorHandler.badRequest());
    }

    const [credentials] = await db
      .insert(connections)
      .values({
        app: appDetails.id,
        accessToken: access_token,
        refreshToken: refresh_token || '',
        expiresAt: new Date(Date.now() + expires_in * 1000),
        userId: req.user.id,
      })
      .returning();

    if (!credentials) {
      return next(
        CustomErrorHandler.badRequest('Failed to create credentials'),
      );
    }

    return res.status(200).send(
      ResponseHandler(200, 'Credentials fetched successfully', {
        id: credentials.id,
        app: credentials.app,
      }),
    );
  },
);

const renderErrorPage = (message: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Error</title>
      </head>
      <body>
        <h1>${message}</h1>
      </body>
    </html>
  `;
};

const renderSucessPage = (code: string, message: string) => {
  return `<!DOCTYPE html>
    <html>
      <head>
        <title>Success</title>
      </head>
      <body>
        <h1>${message}</h1>
        <script>
          window.opener.postMessage({
            type: "OAUTH_SUCCESS",
            code: "${code}",
          }, "*");
          window.close();
        </script>
      </body>
    </html>`;
};
