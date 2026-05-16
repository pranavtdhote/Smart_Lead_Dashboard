/**
 * 404 Not Found handler.
 *
 * Catches all requests that don't match any defined route
 * and forwards a NotFoundError to the error handler.
 */

import type { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../core';

const notFoundHandler = (_req: Request, _res: Response, _next: NextFunction): void => {
  throw new NotFoundError(`Route ${_req.method} ${_req.originalUrl}`);
};

export default notFoundHandler;
