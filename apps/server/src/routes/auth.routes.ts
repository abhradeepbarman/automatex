import { Router } from 'express';
import { userRegister } from '../controllers/auth.controller';

const router: Router = Router();

router.post('/register', userRegister);

export default router;
