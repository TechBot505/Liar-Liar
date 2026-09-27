import type { Deck } from "../types";
import { q1 } from "./q1";
import { q2 } from "./q2";
import { q3 } from "./q3";

/**
 * "After Dark" — the adults-only player deck. Spicy, cheeky and flirty party
 * prompts for a group of adults (18+): embarrassing confessions, dating
 * disasters and playful dares. Kept suggestive, never explicit. Hidden when
 * family-friendly mode is on.
 */
export const deck: Deck = {
  id: "afterdark",
  name: "After Dark",
  tagline: "Pour a drink, lower the lights, spill the tea.",
  description:
    "The grown-up edition. The target answers honestly about their most flirty, embarrassing and scandalous moments while everyone else guesses. 18+ only.",
  kind: "player",
  lieHint: "Write what YOU think {target} would say",
  emoji: "🌙",
  colors: ["#FF2E63", "#1B1B3A"],
  adult: true,
  questions: [...q1, ...q2, ...q3],
};
