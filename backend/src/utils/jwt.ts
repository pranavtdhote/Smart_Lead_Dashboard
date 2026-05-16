import jwt from 'jsonwebtoken';
import env from '../config/env';
import type { JwtPayload } from '../types';

export class Jwt {
  static signAccess(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  static signRefresh(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  static verify(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }
}
