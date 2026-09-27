/**
 * GET /api/history — the signed-in user's played games, newest first, each with the
 * full seat list so the client can render a scoreboard without a second request.
 */
import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { gamePlayers, games } from "@/lib/db/schema";
import { getUserId } from "@/lib/server/auth";
import { dbDisabled, ok, rateLimited, unauthorized } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_GAMES = 50;

export async function GET() {
  const userId = await getUserId();
  if (!userId) return unauthorized();
  if (!rateLimit(`api:history:${userId}`, 60, 60_000).ok) return rateLimited();

  const db = getDb();
  if (!db) return dbDisabled();

  // Seats claimed by this user, then the distinct games behind them, newest first.
  const mySeats = await db
    .select({ gameId: gamePlayers.gameId })
    .from(gamePlayers)
    .where(eq(gamePlayers.userId, userId));

  const gameIds = [...new Set(mySeats.map((s) => s.gameId))];
  if (gameIds.length === 0) return ok({ games: [] });

  const rows = await db
    .select()
    .from(games)
    .where(inArray(games.id, gameIds))
    .orderBy(desc(games.endedAt))
    .limit(MAX_GAMES);

  const allPlayers = await db
    .select({
      id: gamePlayers.id,
      gameId: gamePlayers.gameId,
      seatId: gamePlayers.seatId,
      userId: gamePlayers.userId,
      name: gamePlayers.name,
      avatar: gamePlayers.avatar,
      score: gamePlayers.score,
      rank: gamePlayers.rank,
      stats: gamePlayers.stats,
    })
    .from(gamePlayers)
    .where(inArray(gamePlayers.gameId, gameIds));

  const byGame = new Map<string, typeof allPlayers>();
  for (const p of allPlayers) {
    const list = byGame.get(p.gameId) ?? [];
    list.push(p);
    byGame.set(p.gameId, list);
  }

  const result = rows.map((g) => ({
    ...g,
    players: byGame.get(g.id) ?? [],
  }));

  return ok({ games: result });
}
