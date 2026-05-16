import type { Request, Response, NextFunction } from 'express';
import { Jwt } from '../utils';
import { UnauthorizedError } from '../core';
import type { AuthenticatedRequest } from '../types';

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No access token provided');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError('Malformed access token');
  }

  try {
    const payload = Jwt.verify(token);
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired access token');
  }
};
