/**
 * Custom application error class.
 *
 * Distinguishes between operational errors (expected — bad input, not found)
 * and programmer errors (unexpected — null reference, type errors).
 * Only operational errors are sent to the client; programmer errors trigger
 * a generic 500 response.
 */

import { StatusCodes } from 'http-status-codes';
import type { ValidationErrorDetail } from '../types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors: ValidationErrorDetail[];

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    errors: ValidationErrorDetail[] = [],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Preserve proper stack trace in V8 engines
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ─── Convenience factory functions ──────────────────────────

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, StatusCodes.NOT_FOUND);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, StatusCodes.FORBIDDEN);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', errors: ValidationErrorDetail[] = []) {
    super(message, StatusCodes.BAD_REQUEST, true, errors);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, StatusCodes.CONFLICT);
  }
}
