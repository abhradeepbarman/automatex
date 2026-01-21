import { Router } from 'express';
import {
  getAuthUrl,
  getTokenUrl,
  handleOAuthCallback,
} from '../controllers/credentials.controller';
import { auth } from '../middlewares';

const router: Router = Router();

router.get('/:provider', auth, getAuthUrl);
router.get('/:provider/callback', handleOAuthCallback);
router.post('/:provider/token', auth, getTokenUrl);

export default router;
