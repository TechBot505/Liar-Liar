import { DEFAULT_DECK_ID } from "@/decks/registry";
import type { GameRecord, RoomState, Settings } from "../types";

/** Timing constants (ms). See SPEC "Timers" and "Reveal/Scores auto-advance". */
export const SCORES_MS = 7000;
// Reveal now opens with a ~4s per-player verdict popup before the results list,
// so players need more time on the results screen to read who did what. Raised
// from min(25s, 4.5s*opts + 3s) to give the popup + reading room to breathe.
export const REVEAL_MAX_MS = 40000;
export const REVEAL_PER_OPTION_MS = 6000;
export const REVEAL_BASE_MS = 8000;
export const HOST_TRANSFER_MS = 20000;

/** Reveal deadline duration for a round with `optionCount` options. */
export function revealMs(optionCount: number): number {
  return Math.min(REVEAL_MAX_MS, REVEAL_PER_OPTION_MS * optionCount + REVEAL_BASE_MS);
}

export const DEFAULT_SETTINGS: Settings = {
  deckId: DEFAULT_DECK_ID,
  rounds: 7,
  answerSeconds: 60,
  voteSeconds: 30,
  doubleFinal: true,
  familyMode: true,
};

/** Side effects the host runtime (server) must carry out after a state update. */
export type Effect =
  | { type: "schedule"; at: number }
  | { type: "broadcast" }
  | { type: "error"; to: string; code: string; message: string }
  | { type: "reaction"; playerId: string; emoji: string }
  | { type: "kicked"; to: string }
  | { type: "pong"; to: string; now: number }
  | { type: "gameOver"; record: GameRecord };

export interface ApplyResult {
  state: RoomState;
  effects: Effect[];
}

export function createRoom(code: string, now: number): RoomState {
  return {
    code,
    phase: "lobby",
    hostId: null,
    settings: { ...DEFAULT_SETTINGS },
    players: [],
    gameNumber: 0,
    questions: [],
    round: null,
    history: [],
    bannedTokens: [],
    final: null,
    createdAt: now,
    lastActivityAt: now,
  };
}

export function err(to: string, code: string, message: string): Effect {
  return { type: "error", to, code, message };
}
