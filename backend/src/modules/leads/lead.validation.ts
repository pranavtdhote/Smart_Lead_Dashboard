import { z } from 'zod';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../types';

// ─── Mutation Schemas ────────────────────────────────────────

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  status: z.enum([
    LEAD_STATUSES.NEW,
    LEAD_STATUSES.CONTACTED,
    LEAD_STATUSES.QUALIFIED,
    LEAD_STATUSES.LOST,
  ]).optional(),
  source: z.enum([
    LEAD_SOURCES.WEBSITE,
    LEAD_SOURCES.INSTAGRAM,
    LEAD_SOURCES.REFERRAL,
  ]),
});

export const updateLeadSchema = createLeadSchema.partial();

// ─── Query Schema (GET /leads) ──────────────────────────────
// Validates and sanitizes all query parameters before they
// reach the repository layer. This is the first line of defense
// against malformed or malicious query strings.

export const leadQuerySchema = z.object({
  // Pagination
  page: z.string().optional(),
  limit: z.string().optional(),

  // Sorting
  sortBy: z.enum(['createdAt', 'name', 'status', 'source']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),

  // Search (max 100 chars to prevent absurdly long regex patterns)
  search: z.string().max(100).optional(),

  // Exact-match filters
  status: z.enum([
    LEAD_STATUSES.NEW,
    LEAD_STATUSES.CONTACTED,
    LEAD_STATUSES.QUALIFIED,
    LEAD_STATUSES.LOST,
  ]).optional(),
  source: z.enum([
    LEAD_SOURCES.WEBSITE,
    LEAD_SOURCES.INSTAGRAM,
    LEAD_SOURCES.REFERRAL,
  ]).optional(),

  // Date range filters (ISO 8601 strings)
  fromDate: z.string().date('Invalid date format (use YYYY-MM-DD)').optional(),
  toDate: z.string().date('Invalid date format (use YYYY-MM-DD)').optional(),
});

// ─── Inferred DTOs ──────────────────────────────────────────

export type CreateLeadDto = z.infer<typeof createLeadSchema>;
export type UpdateLeadDto = z.infer<typeof updateLeadSchema>;
export type LeadQueryDto = z.infer<typeof leadQuerySchema>;
