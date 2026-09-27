/**
 * Shared JSON envelope helpers for API routes. Every route returns either
 * { ok: true, data } or { ok: false, reason } so clients can branch uniformly.
 */
import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(reason: string, status: number): NextResponse {
  return NextResponse.json({ ok: false, reason }, { status });
}

/** 503 used when a route needs the DB but DATABASE_URL is unset. */
export function dbDisabled(): NextResponse {
  return fail("db_disabled", 503);
}

export function unauthorized(): NextResponse {
  return fail("unauthorized", 401);
}

export function rateLimited(): NextResponse {
  return fail("rate_limited", 429);
}

export function badRequest(): NextResponse {
  return fail("bad_request", 400);
}
