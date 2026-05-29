// lib/apiHelpers.ts – Shared utilities for Next.js API route handlers
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './auth';
import type { ApiResponse } from '@/types';

// ─── Standard response helpers ────────────────────────────────────────────────

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });
}

export function error(message: string, status = 500) {
  return NextResponse.json<ApiResponse<never>>({ success: false, error: message }, { status });
}

// ─── Auth guards ──────────────────────────────────────────────────────────────

export async function requireAuth(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return { session: null, response: error('Unauthorized', 401) };
  }
  return { session, response: null };
}

export async function requireAdmin(req: NextRequest) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user) {
    return { session: null, response: error('Unauthorized', 401) };
  }
  if (role !== 'admin') {
    return { session: null, response: error('Forbidden – admin only', 403) };
  }
  return { session, response: null };
}

// ─── Async handler wrapper ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (req: NextRequest, ctx?: any) => Promise<NextResponse>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      console.error('[API Error]', err);
      // ⚠️ SECURITY FIX: Never expose internal error details in production
      // Stack traces and DB error messages could reveal implementation details
      const isProd = process.env.NODE_ENV === 'production';
      const message = isProd
        ? 'An unexpected error occurred. Please try again later.'
        : (err instanceof Error ? err.message : 'Internal server error');
      return error(message, 500);
    }
  };
}
