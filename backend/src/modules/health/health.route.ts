/**
 * Health check router.
 *
 * Returns server status, uptime, environment, and timestamp.
 * Used by load balancers, Docker health checks, and monitoring tools.
 */

import { Router } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../../core';

const router = Router();

router.get('/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  ApiResponse.success(res, {
    server: 'running',
    environment: process.env['NODE_ENV'] ?? 'unknown',
    uptime: `${Math.floor(process.uptime())}s`,
    database: dbStatus[dbState] ?? 'unknown',
    timestamp: new Date().toISOString(),
    memoryUsage: {
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
    },
  }, 'API is healthy');
});

export default router;
