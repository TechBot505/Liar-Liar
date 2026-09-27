import type { Deck } from "../types";
import { q1 } from "./q1";
import { q2 } from "./q2";
import { q3 } from "./q3";

/**
 * "Unhinged" — a family-okay-but-deranged player deck. Absurd hypotheticals and
 * chaotic confessions (villain origins, FBI-agent worries, cult leaders, 3am
 * googling) engineered to make people go "what the hell do I even answer". The
 * target answers for real; everyone else writes what they think that person
 * would say. No adult content, just pure chaos.
 */
export const deck: Deck = {
  id: "unhinged",
  name: "Unhinged",
  tagline: "For groups whose group chat should be evidence.",
  description:
    "Absurd hypotheticals and chaotic confessions about the people in the room. The target answers honestly; everyone else guesses what unhinged thing they'd actually say.",
  kind: "player",
  lieHint: "Write what YOU think {target} would say",
  emoji: "🤡",
  colors: ["#A67C52", "#2B2118"],
  questions: [...q1, ...q2, ...q3],
};
