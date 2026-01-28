import { Router } from 'express';
import { proxyRequest } from '../controllers/proxy.controller';
import { auth } from '../middlewares';

const router: Router = Router();

router.get('/', auth, proxyRequest);

export default router;
