import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import { loginRateLimiter } from '../../middlewares/rate-limit';
import * as authController from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/login', loginRateLimiter, authController.login);
authRoutes.get('/me', authenticate, authController.me);