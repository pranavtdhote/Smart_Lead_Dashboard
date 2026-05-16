/**
 * Environment variable validation and type-safe configuration.
 *
 * Uses Zod to parse and validate all required environment variables
 * at startup. The application crashes immediately on invalid config
 * rather than failing later with cryptic errors.
 */

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // ─── Server ────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  // ─── Database ──────────────────────────────────────────
  MONGO_URI: z.string().url({ message: 'MONGO_URI must be a valid connection string' }),

  // ─── JWT ───────────────────────────────────────────────
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // ─── CORS ──────────────────────────────────────────────
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // ─── Rate Limiting ─────────────────────────────────────
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .default('900000')
    .transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX: z
    .string()
    .default('100')
    .transform((val) => parseInt(val, 10)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export type Env = z.infer<typeof envSchema>;
export default env;
