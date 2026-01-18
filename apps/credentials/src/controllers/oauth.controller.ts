import {
  asyncHandler,
  CustomErrorHandler,
  ResponseHandler,
} from '@repo/server-common/utils';
import { NextFunction, Request, Response } from 'express';
import apps from '@repo/common/@apps';
import { AppType, StepType } from '@repo/common/types';
import config from '@repo/server-common/config';
import axios from 'axios';

export const getRedirectUrl = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { app, stepType, stepId } = req.query;

    if (!app || !stepType || !stepId) {
      return next(CustomErrorHandler.badRequest());
    }

    const appDetails = apps.find((a) => a.id === app);
    if (!appDetails) {
      return next(CustomErrorHandler.notFound('App not found'));
    }

    const scopeNeeded = [];

    if (stepType == StepType.TRIGGER) {
      const trigger = appDetails.triggers.find((t) => t.id === stepId);
      if (!trigger) {
        return next(CustomErrorHandler.notFound('Trigger not found'));
      }

      if (!trigger.scopes.length) {
        return next(CustomErrorHandler.notFound('Trigger not found'));
      }

      scopeNeeded.push(...trigger.scopes);
    } else if (stepType == StepType.ACTION) {
      const action = appDetails.actions.find((a) => a.id === stepId);
      if (!action) {
        return next(CustomErrorHandler.notFound('Action not found'));
      }

      if (!action.scopes.length) {
        return next(CustomErrorHandler.notFound('Action not found'));
      }

      scopeNeeded.push(...action.scopes);
    } else {
      return next(CustomErrorHandler.badRequest());
    }

    let finalRedirectUrl = '';

    switch (app) {
      case AppType.GMAIL: {
        const baseUrl = appDetails.auth.redirectUrl;
        const url = new URL(baseUrl);
        url.searchParams.set('client_id', config.GOOGLE_CLIENT_ID);
        url.searchParams.set('redirect_uri', config.GOOGLE_REDIRECT_URL);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('scope', scopeNeeded.join(' '));
        url.searchParams.set('access_type', 'offline');
        url.searchParams.set('prompt', 'consent');

        finalRedirectUrl = url.href;
        break;
      }
      case AppType.SLACK: {
        const baseUrl = appDetails.auth.redirectUrl;

        const url = new URL(baseUrl);
        url.searchParams.set('client_id', config.SLACK_CLIENT_ID);
        url.searchParams.set('scope', scopeNeeded.join(' '));

        finalRedirectUrl = url.href;
        break;
      }
      default:
        break;
    }

    if (!finalRedirectUrl) {
      return next(CustomErrorHandler.notAllowed());
    }

    return res.status(200).send(
      ResponseHandler(200, 'Redirect url fetched', {
        redirectUrl: finalRedirectUrl,
      }),
    );
  },
);

export const getAccessToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { app, stepType, code } = req.query;

    if (!app || !stepType || !code) {
      return next(CustomErrorHandler.badRequest());
    }

    const appDetails = apps.find((a) => a.id === app);
    if (!appDetails) {
      return next(CustomErrorHandler.notFound('App not found'));
    }

    const tokenUrl = appDetails.auth.tokenUrl;
    if (!tokenUrl) {
      return next(CustomErrorHandler.notFound('Token URL not found'));
    }

    let access_token = '';
    let refresh_token = '';
    let expires_in = 0;

    switch (app) {
      case AppType.GMAIL: {
        const res = await axios.post(
          appDetails.auth.tokenUrl,
          new URLSearchParams({
            grant_type: 'authorization_code',
            code: code as string,
            client_id: config.GOOGLE_CLIENT_ID,
            client_secret: config.GOOGLE_CLIENT_SECRET,
            redirect_uri: config.GOOGLE_REDIRECT_URL,
          }),
        );

        access_token = res.data.access_token;
        refresh_token = res.data.refresh_token;
        expires_in = res.data.expires_in;

        break;
      }
      default: {
        return next(CustomErrorHandler.notAllowed());
      }
    }

    return res.status(200).send(
      ResponseHandler(200, 'Access token fetched', {
        access_token,
        refresh_token,
        expires_in,
      }),
    );
  },
);
