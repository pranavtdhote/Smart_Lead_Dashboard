/**
 * Standardized API response helpers.
 *
 * Every API response follows a consistent shape so the frontend
 * can rely on a single parsing strategy.
 */

import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { PaginationMeta, ApiSuccessResponse } from '../types';

export class ApiResponse {
  /**
   * Send a success response with data.
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = StatusCodes.OK,
    meta?: PaginationMeta,
  ): void {
    const response: ApiSuccessResponse<T> = {
      status: 'success',
      message,
      data,
      ...(meta && { meta }),
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send a success response for resource creation.
   */
  static created<T>(res: Response, data: T, message: string = 'Resource created'): void {
    ApiResponse.success(res, data, message, StatusCodes.CREATED);
  }

  /**
   * Send a no-content response (e.g., successful deletion).
   */
  static noContent(res: Response): void {
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
