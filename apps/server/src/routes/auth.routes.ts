import { Router } from 'express';
import {
  refreshAccessToken,
  userLogin,
  userLogout,
  userRegister,
} from '../controllers/auth.controller';
import { auth } from '../middlewares';

const router: Router = Router();

router.post('/register', userRegister);
router.post('/login', userLogin);
router.post('/logout', auth, userLogout);
router.post('/refresh', refreshAccessToken);

export default router;
