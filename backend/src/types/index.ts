/**
 * Global TypeScript type definitions for the application.
 * Extends Express types and defines shared interfaces.
 */

import type { Request } from 'express';

// ─── User Roles ──────────────────────────────────────────────
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  SALES: 'SALES',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ─── Lead Status ─────────────────────────────────────────────
export const LEAD_STATUSES = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  LOST: 'LOST',
} as const;

export type LeadStatus = (typeof LEAD_STATUSES)[keyof typeof LEAD_STATUSES];

// ─── Lead Source ─────────────────────────────────────────────
export const LEAD_SOURCES = {
  WEBSITE: 'WEBSITE',
  INSTAGRAM: 'INSTAGRAM',
  REFERRAL: 'REFERRAL',
} as const;

export type LeadSource = (typeof LEAD_SOURCES)[keyof typeof LEAD_SOURCES];

// ─── JWT Payload ─────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// ─── Authenticated Request ───────────────────────────────────
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

// ─── Pagination ──────────────────────────────────────────────
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── API Response ────────────────────────────────────────────
export interface ApiSuccessResponse<T> {
  status: 'success';
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  status: 'error';
  message: string;
  errors?: ValidationErrorDetail[];
  stack?: string;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}
