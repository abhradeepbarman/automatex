import { auth } from '@repo/server-common/middlewares';
import { Router } from 'express';
import {
  getAccessToken,
  getRedirectUrl,
} from '../controllers/oauth.controller';

const router: Router = Router();

router.get('/redirect-url', auth, getRedirectUrl);
router.get('/access-token', auth, getAccessToken);

export default router;
