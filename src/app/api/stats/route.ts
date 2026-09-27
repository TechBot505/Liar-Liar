/**
 * GET /api/stats — aggregate lifetime stats for the signed-in user, computed from
 * the seats they own (game_players.user_id). Everything is derived in TS from the
 * per-seat columns + the opaque `stats` jsonb blob, so no extra view is needed.
 *
 * Returned fields mirror the local profile stats plus cloud-only totals:
 *   games, wins, winRate, avgRank, totalPoints, timesFooledOthers, truthsFound.
 */
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { gamePlayers } from "@/lib/db/schema";
import { getUserId } from "@/lib/server/auth";
import { dbDisabled, ok, rateLimited, unauthorized } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Read a non-negative integer field out of the opaque per-seat stats blob. */
function statNum(stats: unknown, key: string): number {
  if (stats && typeof stats === "object") {
    const v = (stats as Record<string, unknown>)[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return 0;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  if (!rateLimit(`api:stats:${userId}`, 60, 60_000).ok) return rateLimited();

  const db = getDb();
  if (!db) return dbDisabled();

  const seats = await db
    .select({
      score: gamePlayers.score,
      rank: gamePlayers.rank,
      stats: gamePlayers.stats,
    })
    .from(gamePlayers)
    .where(eq(gamePlayers.userId, userId));

  const games = seats.length;
  const wins = seats.filter((s) => s.rank === 1).length;
  const ranked = seats.filter((s) => s.rank > 0);
  const avgRank =
    ranked.length > 0 ? ranked.reduce((sum, s) => sum + s.rank, 0) / ranked.length : 0;
  const totalPoints = seats.reduce((sum, s) => sum + s.score, 0);
  const timesFooledOthers = seats.reduce((sum, s) => sum + statNum(s.stats, "fooled"), 0);
  const truthsFound = seats.reduce((sum, s) => sum + statNum(s.stats, "truthsFound"), 0);

  return ok({
    stats: {
      games,
      wins,
      winRate: games > 0 ? Math.round((wins / games) * 100) : 0,
      avgRank: Math.round(avgRank * 10) / 10,
      totalPoints,
      timesFooledOthers,
      truthsFound,
    },
  });
}
