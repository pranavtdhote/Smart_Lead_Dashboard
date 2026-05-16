import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../core';
import type { AuthenticatedRequest, UserRole } from '../types';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      // This should never happen if requireAuth is used before requireRole
      throw new ForbiddenError('User context not found');
    }

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError(`Role ${user.role} is not authorized to access this resource`);
    }

    next();
  };
};
