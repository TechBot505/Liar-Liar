import type { OptionResult, PlayerView, RoundResult } from "@/game/types";
import { assignCompetitionRanks } from "@/game/rank";

export type PlayerLookup = (id: string) => PlayerView | undefined;

/** Build a fast id → player accessor from a RoomView player list. */
export function playerLookup(players: PlayerView[]): PlayerLookup {
  const map = new Map(players.map((p) => [p.id, p]));
  return (id) => map.get(id);
}

/** Reveal order: lies first (in result order), the truth last. */
export function orderedReveal(result: RoundResult): OptionResult[] {
  const lies = result.options.filter((o) => !o.isTruth);
  const truth = result.options.filter((o) => o.isTruth);
  return [...lies, ...truth];
}

/** Join names as "Ann", "Ann and Bob", or "Ann, Bob and Cat". */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** Resolve ids to display names, dropping any that don't resolve. */
export function namesOf(ids: string[], lookup: PlayerLookup): string[] {
  return ids.map((id) => lookup(id)?.name).filter((n): n is string => Boolean(n));
}

/** Comma-joined author display names for an option. */
export function authorNames(option: OptionResult, lookup: PlayerLookup): string {
  return joinNames(namesOf(option.authorIds, lookup));
}

/** Standing rows sorted by score desc with competition ranks (ties share a rank). */
export interface RankedRow {
  id: string;
  score: number;
  delta: number;
  rank: number;
  prevRank: number;
}

/**
 * Compute current + previous ranks from totals and this round's deltas using
 * competition ranking (1,2,2,4) — the same scheme as the final standings — so
 * tied players share a rank (three tied ⇒ 1,1,1) and the change arrows compare
 * like-for-like ranks. `prevRank` is derived from each player's score before
 * this round's delta was applied.
 */
export function rankRows(
  entries: { id: string; score: number; delta: number }[],
): RankedRow[] {
  const withPrev = entries.map((e) => ({ ...e, prev: e.score - e.delta }));
  const byNow = [...withPrev].sort((a, b) => b.score - a.score);
  const byPrev = [...withPrev].sort((a, b) => b.prev - a.prev);
  const nowRanks = assignCompetitionRanks(byNow, (e) => e.score);
  const prevRanks = assignCompetitionRanks(byPrev, (e) => e.prev);
  const prevRankById = new Map(byPrev.map((e, i) => [e.id, prevRanks[i]]));
  return byNow.map((e, i) => ({
    id: e.id,
    score: e.score,
    delta: e.delta,
    rank: nowRanks[i],
    prevRank: prevRankById.get(e.id) ?? nowRanks[i],
  }));
}
