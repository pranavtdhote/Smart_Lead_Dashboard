/**
 * Request validation middleware using Zod.
 *
 * Validates request body, query params, and route params
 * against a Zod schema before the request reaches the controller.
 * Throws a standardized BadRequestError on validation failure.
 */

import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { BadRequestError } from '../core';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: { field: string; message: string }[] = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            field: `body.${issue.path.join('.')}`,
            message: issue.message,
          })),
        );
      } else {
        req.body = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            field: `query.${issue.path.join('.')}`,
            message: issue.message,
          })),
        );
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            field: `params.${issue.path.join('.')}`,
            message: issue.message,
          })),
        );
      }
    }

    if (errors.length > 0) {
      throw new BadRequestError('Validation Failed', errors);
    }

    next();
  };
};

export default validate;
