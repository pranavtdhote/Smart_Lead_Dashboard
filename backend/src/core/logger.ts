/**
 * Production-grade logger using Winston.
 *
 * - Console transport with colorized output for development.
 * - File transports for persistent error and combined logs.
 * - Structured JSON format for production log aggregation.
 */

import winston from 'winston';
import env from '../config/env';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// ─── Custom console format for development readability ───────
const devFormat = printf(({ level, message, timestamp: ts, stack }) => {
  const log = `${ts as string} [${level}]: ${message as string}`;
  return stack ? `${log}\n${stack as string}` : log;
});

// ─── Create logger instance ─────────────────────────────────
const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true })),
  defaultMeta: { service: 'smart-leads-api' },
  transports: [
    // Write errors to a dedicated file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: json(),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined file
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: json(),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// In development, also log to console with color
if (env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), devFormat),
    }),
  );
}

export default logger;
