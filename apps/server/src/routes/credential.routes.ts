import { Router } from 'express';
import {
  getAuthUrl,
  handleOAuthCallback,
} from '../controllers/credentials.controller';

const router: Router = Router();

router.get('/:app', getAuthUrl);
router.get('/:app/callback', handleOAuthCallback);

export default router;
