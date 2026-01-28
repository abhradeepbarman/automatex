import { Router } from 'express';
import {
  getAuthUrl,
  getConnections,
  getTokenUrl,
  handleOAuthCallback,
} from '../controllers/credentials.controller';
import { auth } from '../middlewares';

const router: Router = Router();

router.get('/:provider', auth, getAuthUrl);
router.get('/:provider/callback', handleOAuthCallback);
router.get('/:provider/connections', auth, getConnections);
router.post('/:provider/token', auth, getTokenUrl);

export default router;
