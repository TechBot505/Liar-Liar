import type { Deck } from "../types";
import { q1 } from "./q1";
import { q2 } from "./q2";
import { q3 } from "./q3";

/**
 * "Spicy" — the boldest adults-only (18+) player deck. Turns the heat up past
 * After Dark: dating disasters, exes, hookup confessions, drunk decisions, body
 * humor and NSFW-adjacent "most likely to" prompts. The target answers honestly
 * while everyone else guesses. Suggestive and shameless, never graphic — no
 * explicit acts, and nothing punching at protected traits. Hidden in family mode.
 */
export const deck: Deck = {
  id: "spicy",
  name: "Spicy",
  tagline: "Consequences are tomorrow's problem. 18+.",
  description:
    "The unfiltered grown-up edition. The target spills the truth about their most scandalous, drunk and NSFW-adjacent moments while everyone else guesses. 18+ only.",
  kind: "player",
  lieHint: "Write what YOU think {target} would say",
  emoji: "🌶️",
  colors: ["#B5505A", "#2A1418"],
  adult: true,
  questions: [...q1, ...q2, ...q3],
};
