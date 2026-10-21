import { Router } from 'express';
import { login, getMe } from '../controllers/authController.ts';
import { requireAuth, loginRateLimiter } from '../middleware/auth.ts';

const router = Router();

router.post('/login', loginRateLimiter, login);
router.get('/me', requireAuth, getMe);

export default router;
