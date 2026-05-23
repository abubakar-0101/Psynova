import { Request } from 'express';

export interface AuthPayload {
  userId: string;
  email: string;
  role: 'CLIENT' | 'THERAPIST' | 'ADMIN';
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

// Express 5 typed `req.params[k]` as `string | string[]` to allow repeated names.
// Our routes only use single named params; this helper narrows safely.
export const param = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? v[0] ?? '' : v ?? '';

export interface PaginatedQuery {
  page?: string;
  limit?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: unknown;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
