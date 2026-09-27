/**
 * Client-safe environment access. Every value is optional: the app must render
 * and play (guest mode) with ZERO env vars set. Only `NEXT_PUBLIC_*` vars are
 * referenced here so this module is safe to import from client components.
 *
 * Server-only checks (isDbEnabled, PARTY_SECRET, full Clerk secret key) belong
 * in a separate server module — never import those here.
 */

/** Clerk publishable key, if configured. Auth UI renders only when present. */
export const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

/**
 * True when Clerk auth can be initialized on the client. We gate on the
 * publishable key existing; the app degrades to guest play when it does not.
 */
export const isAuthEnabledClient = clerkPublishableKey.length > 0;

/** PartyKit host, defaulting to the local dev server. */
export const partyHost =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "localhost:1999";

/** Public app origin, used for invite links / QR codes and share cards. */
export const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
