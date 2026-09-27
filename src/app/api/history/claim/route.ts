/**
 * POST /api/history/claim — a signed-in user claims the seats they played as a guest.
 *
 * Body: { tokens: string[] } (the client's secret seat tokens). We sha256 each and
 * set user_id on any game_players row whose token_hash matches AND is still
 * unclaimed (user_id IS NULL). Returns how many seats were claimed.
 */
import type { NextRequest } from "next/server";
import { and, inArray, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { gamePlayers, userTokens } from "@/lib/db/schema";
import { getUserId } from "@/lib/server/auth";
import { badRequest, dbDisabled, ok, rateLimited, unauthorized } from "@/lib/server/http";
import { hashTokens } from "@/lib/server/hash";
import { rateLimit } from "@/lib/server/ratelimit";
import { claimSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  if (!rateLimit(`api:claim:${userId}`, 30, 60_000).ok) return rateLimited();

  const db = getDb();
  if (!db) return dbDisabled();

  const body = await req.json().catch(() => null);
  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) return badRequest();

  const hashes = hashTokens(parsed.data.tokens);

  // Remember these tokens so future games (POST /api/games) auto-link without a
  // re-claim. token_hash is unique, so a token already owned by someone stays put.
  await db
    .insert(userTokens)
    .values(hashes.map((tokenHash) => ({ userId, tokenHash })))
    .onConflictDoNothing({ target: userTokens.tokenHash });

  const updated = await db
    .update(gamePlayers)
    .set({ userId })
    .where(and(inArray(gamePlayers.tokenHash, hashes), isNull(gamePlayers.userId)))
    .returning({ id: gamePlayers.id });

  return ok({ claimed: updated.length });
}
