import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate';
import * as authController from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/login', authController.login);
authRoutes.get('/me', authenticate, authController.me);