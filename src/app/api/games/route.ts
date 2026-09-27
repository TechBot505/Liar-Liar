/**
 * POST /api/games — called ONLY by the PartyKit server when a game ends.
 *
 * Auth: the `x-party-secret` header must equal PARTY_SECRET (timing-safe compare).
 * Stores the finished game and its seats. Idempotent: the game id is derived from
 * code + startedAt, so a retried POST upserts the same rows instead of duplicating.
 */
import type { NextRequest } from "next/server";
import { inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { gamePlayers, games, userTokens } from "@/lib/db/schema";
import { partySecret } from "@/lib/server/env";
import { badRequest, dbDisabled, ok, rateLimited, unauthorized } from "@/lib/server/http";
import { checkPartySecret } from "@/lib/server/party-auth";
import { rateLimit } from "@/lib/server/ratelimit";
import { gameRecordSchema } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!checkPartySecret(req.headers.get("x-party-secret"), partySecret())) {
    return unauthorized();
  }
  if (!rateLimit("api:games", 120, 60_000).ok) return rateLimited();

  const db = getDb();
  if (!db) return dbDisabled();

  const body = await req.json().catch(() => null);
  const parsed = gameRecordSchema.safeParse(body);
  if (!parsed.success) return badRequest();
  const rec = parsed.data;

  const id = `${rec.code}:${rec.startedAt}`;
  await db
    .insert(games)
    .values({
      id,
      code: rec.code,
      deckId: rec.deckId,
      rounds: rec.rounds,
      startedAt: new Date(rec.startedAt),
      endedAt: new Date(rec.endedAt),
      playerCount: rec.players.length,
    })
    .onConflictDoUpdate({
      target: games.id,
      set: { endedAt: new Date(rec.endedAt), playerCount: rec.players.length },
    });

  // Auto-link: any seat whose token was previously claimed maps straight to its
  // owner, so games recorded after the first claim need no re-claim.
  const hashes = rec.players.map((p) => p.tokenHash).filter((h) => h.length > 0);
  const owners = new Map<string, string>();
  if (hashes.length > 0) {
    const rows = await db
      .select({ tokenHash: userTokens.tokenHash, userId: userTokens.userId })
      .from(userTokens)
      .where(inArray(userTokens.tokenHash, hashes));
    for (const r of rows) owners.set(r.tokenHash, r.userId);
  }

  for (const p of rec.players) {
    const userId = owners.get(p.tokenHash) ?? null;
    await db
      .insert(gamePlayers)
      .values({
        gameId: id,
        seatId: p.seatId,
        userId,
        name: p.name,
        avatar: p.avatar,
        score: p.score,
        rank: p.rank,
        stats: p.stats,
        tokenHash: p.tokenHash,
      })
      // Idempotent per seat; never clobbers a user_id already claimed. A retried
      // POST refreshes score/stats but leaves ownership to the claim/link flow.
      .onConflictDoUpdate({
        target: [gamePlayers.gameId, gamePlayers.seatId],
        set: { score: p.score, rank: p.rank, stats: p.stats, tokenHash: p.tokenHash },
      });
  }

  return ok({ id, players: rec.players.length });
}
