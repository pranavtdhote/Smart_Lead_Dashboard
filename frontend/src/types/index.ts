// Shared types based on backend definitions

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  SALES: 'SALES',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface ApiSuccessResponse<T> {
  status: 'success';
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiErrorResponse {
  status: 'error';
  message: string;
  errors?: { field: string; message: string }[];
}
