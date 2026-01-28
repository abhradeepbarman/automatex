import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { auth } from '../middlewares';

const router: Router = Router();

router.get('/stats', auth, getDashboardStats);

export default router;
