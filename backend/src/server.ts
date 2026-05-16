/**
 * Production-ready server bootstrap.
 *
 * Handles:
 * - Database connection before accepting traffic
 * - Graceful shutdown on SIGINT/SIGTERM (closes DB, drains connections)
 * - Unhandled rejection & uncaught exception safety nets
 */

import app from './app';
import env from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { logger } from './core';
import type { Server } from 'http';

let server: Server;

const startServer = async (): Promise<void> => {
  // Connect to MongoDB before starting HTTP server
  await connectDB();

  server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`📍 Health check: http://localhost:${env.PORT}/api/v1/health`);
  });

  // Handle server-level errors (e.g., port already in use)
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${env.PORT} is already in use`);
      process.exit(1);
    }
    throw error;
  });
};

// ─── Graceful Shutdown ──────────────────────────────────────
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    logger.info('HTTP server closed');
  });

  // Close database connection
  await disconnectDB();

  logger.info('Graceful shutdown completed');
  process.exit(0);
};

process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});
process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});

// ─── Safety Nets ────────────────────────────────────────────
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', { reason });
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', error);
  process.exit(1);
});

// ─── Start ──────────────────────────────────────────────────
void startServer();
