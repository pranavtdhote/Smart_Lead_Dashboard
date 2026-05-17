import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../core';
import type { RegisterDto, LoginDto } from './auth.validation';
import type { AuthenticatedRequest } from '../../types';

export class AuthController {
  /**
   * Register — returns BOTH tokens in the JSON body.
   *
   * Why no cookies?
   * In a Vercel + Render deployment the frontend and backend live on
   * completely different domains (e.g. app.vercel.app ↔ api.onrender.com).
   * Browsers block cross-origin cookies even with SameSite=None in many
   * modern browsers (Safari, Firefox strict mode). Sending both tokens
   * in the response body and storing them in localStorage is the
   * industry-standard approach used by Auth0, Firebase, and Supabase.
   */
  static async register(req: Request<{}, {}, RegisterDto>, res: Response): Promise<void> {
    const { user, tokens } = await AuthService.register(req.body);

    ApiResponse.created(
      res,
      { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
      'Registration successful',
    );
  }

  static async login(req: Request<{}, {}, LoginDto>, res: Response): Promise<void> {
    const { user, tokens } = await AuthService.login(req.body);

    ApiResponse.success(
      res,
      { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
      'Login successful',
    );
  }

  /**
   * Refresh — accepts the refresh token from the request BODY.
   * Falls back to cookie for backwards-compatibility with local dev.
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken =
      (req.body?.refreshToken as string | undefined) ??
      (req.cookies?.refreshToken as string | undefined);

    if (!refreshToken) {
      res.status(401).json({ status: 'error', message: 'No refresh token provided' });
      return;
    }

    const { tokens } = await AuthService.refresh(refreshToken);

    ApiResponse.success(
      res,
      { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
      'Token refreshed successfully',
    );
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
