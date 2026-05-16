/**
 * Global error handling middleware.
 *
 * This is the SINGLE place where all errors are caught, logged,
 * and formatted into a consistent API response. It handles:
 * - AppError (our custom operational errors)
 * - Mongoose validation & cast errors
 * - Duplicate key errors from MongoDB
 * - Zod validation errors
 * - Unknown/programmer errors (generic 500)
 */

import type { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError, logger } from '../core';
import type { ApiErrorResponse, ValidationErrorDetail } from '../types';
import env from '../config/env';

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // ─── Default values ──────────────────────────────────────
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let errors: ValidationErrorDetail[] = [];
  let isOperational = false;

  // ─── Our custom AppError ─────────────────────────────────
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
    isOperational = err.isOperational;
  }

  // ─── Zod validation errors ──────────────────────────────
  else if (err instanceof ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation Failed';
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    isOperational = true;
  }

  // ─── Mongoose validation error ──────────────────────────
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation Failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    isOperational = true;
  }

  // ─── Mongoose cast error (invalid ObjectId, etc.) ───────
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = `Invalid value for ${err.path}: ${err.value as string}`;
    isOperational = true;
  }

  // ─── MongoDB duplicate key error (code 11000) ──────────
  else if (
    'code' in err &&
    (err as Record<string, unknown>).code === 11000 &&
    'keyValue' in err
  ) {
    statusCode = StatusCodes.CONFLICT;
    const keyValue = (err as Record<string, unknown>).keyValue as Record<string, unknown>;
    const field = Object.keys(keyValue)[0] ?? 'unknown';
    message = `Duplicate value for field: ${field}`;
    isOperational = true;
  }

  // ─── Logging ─────────────────────────────────────────────
  if (isOperational) {
    logger.warn(`${statusCode} - ${message}`, { errors });
  } else {
    logger.error('UNHANDLED ERROR:', err);
  }

  // ─── Response ────────────────────────────────────────────
  const response: ApiErrorResponse = {
    status: 'error',
    message,
    ...(errors.length > 0 && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

export default errorHandler;
