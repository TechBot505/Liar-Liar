import { computeAwards } from "../awards";
import { assignCompetitionRanks } from "../rank";
import type {
  GamePlayerRecord, GameRecord, PlayerStats, RoomState, RoundResult, Standing,
} from "../types";
import type { ApplyResult } from "./constants";

/** Competition ranking (1,2,2,4) over players sorted by score descending. */
export function computeStandings(state: RoomState): Standing[] {
  const sorted = state.players
    .slice()
    .sort((a, b) => b.score - a.score || a.joinedAt - b.joinedAt);
  const ranks = assignCompetitionRanks(sorted, (p) => p.score);
  return sorted.map((p, i) => ({
    playerId: p.id,
    name: p.name,
    avatar: p.avatar,
    score: p.score,
    rank: ranks[i],
  }));
}

function blankStats(): PlayerStats {
  return { fooled: 0, truthsFound: 0, gullible: 0, bestSingleLie: 0, avgSubmitMs: 0 };
}

/** Per-player aggregate stats over the whole game, for the record + history UI. */
export function computeStats(history: RoundResult[]): Record<string, PlayerStats> {
  const stats: Record<string, PlayerStats> = {};
  const latSum: Record<string, number> = {};
  const latCount: Record<string, number> = {};
  const get = (id: string): PlayerStats => (stats[id] ??= blankStats());
  for (const r of history) {
    for (const [pid, ms] of Object.entries(r.latencies)) {
      get(pid);
      latSum[pid] = (latSum[pid] ?? 0) + ms;
      latCount[pid] = (latCount[pid] ?? 0) + 1;
    }
    for (const opt of r.options) {
      if (opt.isTruth) {
        for (const v of opt.voterIds) get(v).truthsFound += 1;
      } else {
        const n = opt.voterIds.length;
        for (const a of opt.authorIds) {
          const s = get(a);
          s.fooled += n;
          s.bestSingleLie = Math.max(s.bestSingleLie, n);
        }
        for (const v of opt.voterIds) get(v).gullible += 1;
      }
    }
  }
  for (const id of Object.keys(stats)) {
    stats[id].avgSubmitMs = latCount[id] ? Math.round(latSum[id] / latCount[id]) : 0;
  }
  return stats;
}

function buildRecord(state: RoomState, standings: Standing[], now: number): GameRecord {
  const stats = computeStats(state.history);
  const rankById = new Map(standings.map((s) => [s.playerId, s.rank]));
  const players: GamePlayerRecord[] = state.players.map((p) => ({
    seatId: p.id,
    name: p.name,
    avatar: p.avatar,
    score: p.score,
    rank: rankById.get(p.id) ?? 0,
    stats: stats[p.id] ?? blankStats(),
    // Placeholder — the server fills this with sha256(token) before persisting.
    tokenHash: "",
  }));
  return {
    code: state.code,
    deckId: state.settings.deckId,
    rounds: state.settings.rounds,
    startedAt: state.createdAt,
    endedAt: now,
    players,
    awards: computeAwards(state.history, state.settings.answerSeconds),
  };
}

export function enterFinal(state: RoomState, now: number): ApplyResult {
  const standings = computeStandings(state);
  const awards = computeAwards(state.history, state.settings.answerSeconds);
  const record = buildRecord(state, standings, now);
  state.final = { standings, awards };
  state.phase = "final";
  state.round = null;
  return { state, effects: [{ type: "broadcast" }, { type: "gameOver", record }] };
}
