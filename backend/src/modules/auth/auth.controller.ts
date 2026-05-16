import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../core';
import env from '../../config/env';
import type { RegisterDto, LoginDto } from './auth.validation';
import type { AuthenticatedRequest } from '../../types';

export class AuthController {
  private static readonly COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  static async register(req: Request<{}, {}, RegisterDto>, res: Response): Promise<void> {
    const { user, tokens } = await AuthService.register(req.body);

    res.cookie('refreshToken', tokens.refreshToken, AuthController.COOKIE_OPTIONS);

    ApiResponse.created(res, { user, accessToken: tokens.accessToken }, 'Registration successful');
  }

  static async login(req: Request<{}, {}, LoginDto>, res: Response): Promise<void> {
    const { user, tokens } = await AuthService.login(req.body);

    res.cookie('refreshToken', tokens.refreshToken, AuthController.COOKIE_OPTIONS);

    ApiResponse.success(res, { user, accessToken: tokens.accessToken }, 'Login successful');
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (!refreshToken) {
      // Don't throw AppError, just 401 response is better for silent refreshes
      res.status(401).json({ status: 'error', message: 'No refresh token provided' });
      return;
    }

    const { tokens } = await AuthService.refresh(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, AuthController.COOKIE_OPTIONS);

    ApiResponse.success(res, { accessToken: tokens.accessToken }, 'Token refreshed successfully');
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('refreshToken');
    ApiResponse.success(res, null, 'Logged out successfully');
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const user = await AuthService.getMe(authReq.user.userId);
    ApiResponse.success(res, { user }, 'User profile retrieved');
  }
}
