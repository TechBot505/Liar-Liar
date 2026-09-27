import type { Award } from "@/game/types";
import type { AvatarConfig } from "@/lib/avatar";

/** A single player line in a normalized history item. */
export interface HistoryItemPlayer {
  id?: string;
  name: string;
  avatar: AvatarConfig;
  score: number;
  rank: number;
  isYou: boolean;
}

/** Local + cloud games normalized to one shape for the history UI. */
export interface HistoryItem {
  id: string;
  code: string;
  deckId: string;
  playedAt: number;
  players: HistoryItemPlayer[];
  yourRank: number;
  youId?: string;
  awards: Award[];
  source: "local" | "cloud";
}

/** Signature used to de-dupe the same game arriving from local + cloud. */
export function historyKey(item: {
  code: string;
  players: { score: number }[];
}): string {
  const scores = item.players.map((p) => p.score).sort((a, b) => a - b).join(",");
  return `${item.code}|${item.players.length}|${scores}`;
}
