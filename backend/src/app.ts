/**
 * Express Application Setup.
 *
 * Configures all global middlewares, security headers, rate limiting,
 * API versioning, and error handling in a clean, layered order.
 *
 * Middleware order matters:
 *  1. Security (helmet, cors, rate-limit)
 *  2. Parsing (json, urlencoded, cookies)
 *  3. Logging (morgan -> winston)
 *  4. Routes
 *  5. 404 handler
 *  6. Error handler (MUST be last)
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import env from './config/env';
import { morganLogger, notFoundHandler, errorHandler } from './middlewares';
import healthRoute from './modules/health/health.route';

import authRoutes from './modules/auth/auth.route';

const app = express();

// ─── 1. Security Middlewares ─────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.options(/.*/, cors());

// Global rate limiter — prevents brute force & DDoS
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
});
app.use(limiter);

// ─── 2. Body Parsing ────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── 3. HTTP Request Logging ────────────────────────────────
app.use(morganLogger);

// ─── 4. API Routes (Versioned) ──────────────────────────────
import leadRoutes from './modules/leads/lead.route';

const API_PREFIX = '/api/v1';

app.use(API_PREFIX, healthRoute);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/leads`, leadRoutes);
// app.use(`${API_PREFIX}/users`, userRoutes);

// ─── 5. 404 Handler (must be after all routes) ──────────────
app.use(notFoundHandler);

// ─── 6. Global Error Handler (must be LAST middleware) ──────
app.use(errorHandler);

export default app;
