/**
 * Constant-time comparison of the x-party-secret header against PARTY_SECRET.
 * Kept as a pure helper so it can be unit-tested without a request.
 */
import { timingSafeEqual } from "node:crypto";

/**
 * Timing-safe string equality. Returns false for length mismatch (length is not
 * secret here) without leaking timing on the content comparison for equal lengths.
 */
export function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * True when `header` matches the configured secret. Always false when either the
 * header or the configured secret is missing/empty.
 */
export function checkPartySecret(header: string | null | undefined, secret: string | undefined): boolean {
  if (!header || !secret) return false;
  return timingSafeEqualStr(header, secret);
}
