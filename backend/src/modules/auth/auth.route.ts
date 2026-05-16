import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate, asyncHandler } from '../../middlewares';
import { requireAuth } from '../../middlewares/auth.middleware';
import { registerSchema, loginSchema } from './auth.validation';

const router = Router();

router.post('/register', validate({ body: registerSchema }), asyncHandler(AuthController.register));
router.post('/login', validate({ body: loginSchema }), asyncHandler(AuthController.login));
router.post('/refresh', asyncHandler(AuthController.refresh));
router.post('/logout', asyncHandler(AuthController.logout));

router.get('/me', requireAuth, asyncHandler(AuthController.getMe));

export default router;
