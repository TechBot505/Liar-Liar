/**
 * Integration tests for the persistence API routes. They run the real route
 * handlers against an in-process PGlite Postgres (via the setDbForTests seam) and
 * mock getUserId (the auth seam) to simulate signed-in / signed-out callers.
 *
 * Coverage: POST /api/games (secret auth, idempotency, auto-link via user_tokens),
 * POST /api/history/claim, GET /api/history, GET/PUT /api/profile, GET /api/stats.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { sql } from "drizzle-orm";

// Mock the auth seam BEFORE importing the routes that consume it.
vi.mock("@/lib/server/auth", () => ({ getUserId: vi.fn() }));

import { getUserId } from "@/lib/server/auth";
import { setDbForTests, type Database } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sha256Hex } from "@/lib/server/hash";
import { resetRateLimits } from "@/lib/server/ratelimit";
import { makeTestDb, type TestDb } from "@/lib/db/__tests__/testDb";

import { POST as gamesPOST } from "@/app/api/games/route";
import { POST as claimPOST } from "@/app/api/history/claim/route";
import { GET as historyGET } from "@/app/api/history/route";
import { GET as profileGET, PUT as profilePUT } from "@/app/api/profile/route";
import { GET as statsGET } from "@/app/api/stats/route";

const SECRET = "test-party-secret";
const USER = "user_test_1";
const getUserIdMock = vi.mocked(getUserId);

let tdb: TestDb;

/** Build a NextRequest with a JSON body (and optional headers). */
function jsonReq(url: string, body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function putReq(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const AVATAR = { face: "egg", color: "#9CAF88", eyes: "wide", mouth: "grin", accessory: "none", bg: "#1C231C" };

function gameRecord(overrides: Record<string, unknown> = {}) {
  return {
    code: "ABCD",
    deckId: "facts",
    rounds: 5,
    startedAt: 1_700_000_000_000,
    endedAt: 1_700_000_100_000,
    players: [
      {
        seatId: "seat-1",
        name: "Alice",
        avatar: AVATAR,
        score: 30,
        rank: 1,
        stats: { fooled: 4, truthsFound: 3, gullible: 1, bestSingleLie: 2, avgSubmitMs: 900 },
        tokenHash: sha256Hex("token-alice"),
      },
      {
        seatId: "seat-2",
        name: "Bob",
        avatar: AVATAR,
        score: 10,
        rank: 2,
        stats: { fooled: 1, truthsFound: 1, gullible: 3, bestSingleLie: 1, avgSubmitMs: 1500 },
        tokenHash: sha256Hex("token-bob"),
      },
    ],
    ...overrides,
  };
}

beforeAll(async () => {
  process.env.PARTY_SECRET = SECRET;
  tdb = await makeTestDb();
  setDbForTests(tdb.db);
});

afterAll(async () => {
  setDbForTests(undefined);
  await tdb.close();
});

beforeEach(async () => {
  resetRateLimits();
  getUserIdMock.mockReset();
  // Fresh state per test: wipe user-owned tables, then reseed the signed-in user.
  const db: Database = tdb.db;
  await db.execute(
    sql.raw("TRUNCATE game_players, games, user_tokens, profiles, users RESTART IDENTITY CASCADE"),
  );
  await db.insert(users).values({ id: USER }).onConflictDoNothing();
});

describe("POST /api/games", () => {
  it("rejects without the party secret", async () => {
    const res = await gamesPOST(jsonReq("http://localhost/api/games", gameRecord()));
    expect(res.status).toBe(401);
  });

  it("stores a game + seats with the secret, and is idempotent", async () => {
    const first = await gamesPOST(
      jsonReq("http://localhost/api/games", gameRecord(), { "x-party-secret": SECRET }),
    );
    expect(first.status).toBe(200);
    const body = (await first.json()) as { data: { id: string; players: number } };
    expect(body.data.players).toBe(2);

    // Re-POST the same record → no duplicate rows (upsert on game+seat).
    const second = await gamesPOST(
      jsonReq("http://localhost/api/games", gameRecord(), { "x-party-secret": SECRET }),
    );
    expect(second.status).toBe(200);

    getUserIdMock.mockResolvedValue(USER);
    // Claim then read history: exactly one game visible.
    await claimPOST(jsonReq("http://localhost/api/history/claim", { tokens: ["token-alice"] }));
    const hist = await historyGET();
    const histBody = (await hist.json()) as { data: { games: unknown[] } };
    expect(histBody.data.games).toHaveLength(1);
  });

  it("auto-links a seat to a user who already claimed that token", async () => {
    getUserIdMock.mockResolvedValue(USER);
    // Claim the token FIRST (records it in user_tokens).
    await claimPOST(jsonReq("http://localhost/api/history/claim", { tokens: ["token-alice"] }));

    // A NEW game with the same token hash should attach to USER at POST time.
    const rec = gameRecord({ code: "WXYZ", startedAt: 1_700_000_200_000 });
    await gamesPOST(jsonReq("http://localhost/api/games", rec, { "x-party-secret": SECRET }));

    const hist = await historyGET();
    const body = (await hist.json()) as { data: { games: { code: string }[] } };
    // Both games (claimed + auto-linked) are now owned by the user.
    expect(body.data.games.map((g) => g.code).sort()).toEqual(["WXYZ"]);
  });

  it("rejects a malformed body with 400", async () => {
    const res = await gamesPOST(
      jsonReq("http://localhost/api/games", { code: "" }, { "x-party-secret": SECRET }),
    );
    expect(res.status).toBe(400);
  });
});

describe("POST /api/history/claim", () => {
  it("401s when signed out", async () => {
    getUserIdMock.mockResolvedValue(null);
    const res = await claimPOST(jsonReq("http://localhost/api/history/claim", { tokens: ["x"] }));
    expect(res.status).toBe(401);
  });

  it("links seats matching the claimed tokens", async () => {
    await gamesPOST(jsonReq("http://localhost/api/games", gameRecord(), { "x-party-secret": SECRET }));
    getUserIdMock.mockResolvedValue(USER);
    const res = await claimPOST(
      jsonReq("http://localhost/api/history/claim", { tokens: ["token-alice"] }),
    );
    const body = (await res.json()) as { data: { claimed: number } };
    expect(body.data.claimed).toBe(1);
  });
});

describe("GET /api/history", () => {
  it("returns only the signed-in user's games, newest first", async () => {
    await gamesPOST(jsonReq("http://localhost/api/games", gameRecord(), { "x-party-secret": SECRET }));
    await gamesPOST(
      jsonReq(
        "http://localhost/api/games",
        gameRecord({ code: "EFGH", startedAt: 1_700_000_300_000, endedAt: 1_700_000_400_000 }),
        { "x-party-secret": SECRET },
      ),
    );
    getUserIdMock.mockResolvedValue(USER);
    await claimPOST(jsonReq("http://localhost/api/history/claim", { tokens: ["token-alice"] }));

    const res = await historyGET();
    const body = (await res.json()) as { data: { games: { code: string; players: unknown[] }[] } };
    expect(body.data.games).toHaveLength(2);
    // newest first (EFGH ended later)
    expect(body.data.games[0].code).toBe("EFGH");
    expect(body.data.games[0].players.length).toBe(2);
  });

  it("401s when signed out", async () => {
    getUserIdMock.mockResolvedValue(null);
    const res = await historyGET();
    expect(res.status).toBe(401);
  });
});

describe("GET/PUT /api/profile", () => {
  it("returns null before a profile exists, then upserts and reads back", async () => {
    getUserIdMock.mockResolvedValue(USER);

    const empty = await profileGET();
    const emptyBody = (await empty.json()) as { data: { profile: unknown } };
    expect(emptyBody.data.profile).toBeNull();

    const put = await profilePUT(
      putReq("http://localhost/api/profile", { name: "Alice", avatar: AVATAR }),
    );
    expect(put.status).toBe(200);

    const got = await profileGET();
    const gotBody = (await got.json()) as { data: { profile: { name: string } } };
    expect(gotBody.data.profile.name).toBe("Alice");
  });

  it("rejects an invalid profile (empty name) with 400", async () => {
    getUserIdMock.mockResolvedValue(USER);
    const res = await profilePUT(putReq("http://localhost/api/profile", { name: "", avatar: AVATAR }));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/stats", () => {
  it("aggregates the user's owned seats", async () => {
    await gamesPOST(jsonReq("http://localhost/api/games", gameRecord(), { "x-party-secret": SECRET }));
    getUserIdMock.mockResolvedValue(USER);
    await claimPOST(jsonReq("http://localhost/api/history/claim", { tokens: ["token-alice"] }));

    const res = await statsGET();
    const body = (await res.json()) as {
      data: { stats: { games: number; wins: number; totalPoints: number; timesFooledOthers: number; truthsFound: number } };
    };
    expect(body.data.stats.games).toBe(1);
    expect(body.data.stats.wins).toBe(1);
    expect(body.data.stats.totalPoints).toBe(30);
    expect(body.data.stats.timesFooledOthers).toBe(4);
    expect(body.data.stats.truthsFound).toBe(3);
  });
});
