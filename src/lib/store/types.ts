import type { Award } from "@/game/types";
import type { AvatarConfig } from "@/lib/avatar";

/** Locally-stored player identity. `token` is a secret used to reclaim a seat. */
export interface Profile {
  id: string;
  token: string;
  name: string;
  avatar: AvatarConfig;
  createdAt: number;
  /** epoch ms of the last local edit. Drives cloud-sync conflict resolution
   *  (newer side wins). Optional for backward-compat with older stored profiles. */
  updatedAt?: number;
}

/** One player's line in a past game's summary. */
export interface HistoryPlayer {
  /** Room seat id — optional for backward-compat with older stored games. */
  id?: string;
  name: string;
  avatar: AvatarConfig;
  score: number;
  rank: number;
  isYou: boolean;
}

/** A finished game recorded to local history (last 50 kept). */
export interface GameSummary {
  id: string;
  code: string;
  deckId: string;
  playedAt: number;
  players: HistoryPlayer[];
  yourRank: number;
  /** Your seat id, so awards can be attributed to you. Optional (backward-compat). */
  youId?: string;
  awards: Award[];
}

/** Sound + haptic preferences (default ON). */
export interface Prefs {
  sound: boolean;
  haptics: boolean;
}
