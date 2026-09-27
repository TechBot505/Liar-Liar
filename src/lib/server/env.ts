/**
 * Server-only environment helpers. These read process.env, so they must never be
 * imported into client bundles. Client-safe helpers live in src/lib/env.ts.
 *
 * The whole app degrades gracefully: with no env vars set, auth and DB are simply
 * "off" and the game runs in guest/local-only mode.
 */

/** Auth is enabled only when BOTH Clerk keys are present. */
export function isAuthEnabled(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !!process.env.CLERK_SECRET_KEY
  );
}

/** Cloud persistence is enabled only when a Postgres connection string is present. */
export function isDbEnabled(): boolean {
  return !!process.env.DATABASE_URL;
}

/** Shared secret the PartyKit server uses to authenticate POST /api/games. */
export function partySecret(): string | undefined {
  return process.env.PARTY_SECRET || undefined;
}
