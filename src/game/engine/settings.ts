import { getDeck } from "@/decks/registry";
import { ANSWER_OPTIONS, ROUND_OPTIONS, VOTE_OPTIONS } from "../types";
import type { Settings } from "../types";

export interface SettingsError {
  code: string;
  message: string;
}

/**
 * Validate settings against SPEC constraints. Returns an error or null.
 * `deckId` must resolve to a real deck, and adult decks are disallowed while
 * family mode is on.
 */
export function validateSettings(s: Settings): SettingsError | null {
  if (!(ROUND_OPTIONS as readonly number[]).includes(s.rounds)) {
    return { code: "bad_settings", message: "Rounds must be 5, 7 or 10." };
  }
  if (!(ANSWER_OPTIONS as readonly number[]).includes(s.answerSeconds)) {
    return { code: "bad_settings", message: "Invalid answer timer." };
  }
  if (!(VOTE_OPTIONS as readonly number[]).includes(s.voteSeconds)) {
    return { code: "bad_settings", message: "Invalid vote timer." };
  }
  const deck = getDeck(s.deckId);
  if (!deck) return { code: "bad_settings", message: "Unknown deck." };
  if (s.familyMode && deck.adult) {
    return { code: "bad_settings", message: "Adult deck not allowed in family mode." };
  }
  return null;
}

/** Merge a partial settings patch onto a base, coercing nothing (zod already validated shapes). */
export function mergeSettings(base: Settings, patch: Partial<Settings>): Settings {
  return { ...base, ...patch };
}
