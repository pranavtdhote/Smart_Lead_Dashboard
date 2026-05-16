/**
 * Pagination utility.
 *
 * Parses raw query params into validated pagination options
 * and builds the pagination metadata for API responses.
 *
 * Performance notes:
 *  - MAX_LIMIT is capped at 100 to prevent memory-intensive queries.
 *  - Default sort is createdAt DESC (newest first) to align with
 *    the compound index on { createdBy: 1, createdAt: -1 }.
 */

import type { PaginationMeta, PaginationQuery } from '../types';

// ─── Configuration Constants ────────────────────────────────
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const DEFAULT_SORT_BY = 'createdAt';
const DEFAULT_SORT_ORDER: 1 | -1 = -1; // newest first

// ─── Allowed sort fields whitelist ──────────────────────────
// Prevents arbitrary field sorting which could bypass indexes
const ALLOWED_SORT_FIELDS = new Set([
  'createdAt',
  'name',
  'email',
  'status',
  'source',
]);

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 1 | -1;
}

/**
 * Parse raw query parameters into validated pagination options.
 * Clamps values to safe ranges and validates sort fields.
 */
export const parsePagination = (query: PaginationQuery): PaginationOptions => {
  const page = Math.max(parseInt(query.page ?? '', 10) || DEFAULT_PAGE, 1);
  const rawLimit = parseInt(query.limit ?? '', 10) || DEFAULT_LIMIT;
  const limit = Math.min(Math.max(rawLimit, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  // Whitelist sort field — fallback to default if invalid
  const requestedSortBy = query.sortBy ?? DEFAULT_SORT_BY;
  const sortBy = ALLOWED_SORT_FIELDS.has(requestedSortBy) ? requestedSortBy : DEFAULT_SORT_BY;

  const sortOrder = query.sortOrder === 'asc' ? 1 : DEFAULT_SORT_ORDER;

  return { page, limit, skip, sortBy, sortOrder };
};

/**
 * Build pagination metadata for the API response.
 */
export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
