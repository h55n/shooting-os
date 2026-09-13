import { NextResponse } from 'next/server';
import type { ApiError, ApiSuccess } from '@/lib/domain/types';

export function ok<T>(data: T, init?: ResponseInit, meta?: Record<string, unknown>) {
  const body: ApiSuccess<T> = { ok: true, data, ...(meta ? { meta } : {}) };
  return NextResponse.json(body, init);
}

export function fail(error: string, userMessage: string, status = 400, details?: unknown) {
  const body: ApiError = {
    ok: false,
    error,
    userMessage,
    ...(process.env.NODE_ENV === 'development' && details !== undefined ? { details } : {}),
  };
  return NextResponse.json(body, { status });
}
