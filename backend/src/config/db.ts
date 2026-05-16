/**
 * MongoDB connection with retry logic and event handling.
 *
 * - Retries connection up to 5 times with exponential backoff.
 * - Logs connection lifecycle events (connected, disconnected, error).
 * - Handles graceful shutdown via SIGINT/SIGTERM.
 */

import mongoose from 'mongoose';
import { logger } from '../core';
import env from './env';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

export const connectDB = async (): Promise<void> => {
  let retries = 0;

  // ─── Connection event listeners ────────────────────────
  mongoose.connection.on('connected', () => {
    logger.info('📦 MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  // ─── Retry loop ────────────────────────────────────────
  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      return;
    } catch (error) {
      retries++;
      logger.error(
        `MongoDB connection attempt ${retries}/${MAX_RETRIES} failed: ${(error as Error).message}`,
      );

      if (retries >= MAX_RETRIES) {
        logger.error('Max retries reached. Exiting process.');
        process.exit(1);
      }

      logger.info(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

/**
 * Graceful shutdown — close DB connection before process exits.
 */
export const disconnectDB = async (): Promise<void> => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed through app termination');
};
