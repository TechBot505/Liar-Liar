import type { Deck } from "../types";
import { q1 } from "./q1";
import { q2 } from "./q2";
import { q3 } from "./q3";
import { q4 } from "./q4";

/**
 * "The Truth Comes Out" — the flagship player deck. Family friendly, broadly
 * relatable prompts that work for friends, family and coworkers. The target
 * player answers honestly; everyone else guesses what they'd say.
 */
export const deck: Deck = {
  id: "truth",
  name: "The Truth Comes Out",
  tagline: "How well do you really know each other?",
  description:
    "The target answers about themselves for real. Everyone else writes what they think that person would say, then tries to spot the truth in the pile.",
  kind: "player",
  lieHint: "Write what YOU think {target} would say",
  emoji: "🤥",
  colors: ["#FF4FD8", "#7A5CFF"],
  questions: [...q1, ...q2, ...q3, ...q4],
};
