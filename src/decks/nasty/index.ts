import type { Deck } from "../types";
import { questions as q1 } from "./q1";
import { questions as q2 } from "./q2";
import { questions as q3 } from "./q3";
import { questions as q4 } from "./q4";
import { questions as q5 } from "./q5";

/**
 * "Nature Is Nasty" -- the gross-but-real fact deck. Verified, R-rated-ish
 * trivia about animal biology (mating, defense, bodily functions), the human
 * body, bizarre medical conditions, and grim historical medicine. The truth is
 * revolting enough that any plausible-sounding lie can blend right in. Many
 * prompts are marked adult (sex/bathroom) and hide when family mode is on.
 */
export const deck: Deck = {
  id: "nasty",
  name: "Nature Is Nasty",
  tagline: "The 'why do I know this now' deck.",
  description:
    "Fill in the blank with the real (and revolting) fact -- or invent one gross enough to fool the room.",
  kind: "fact",
  lieHint: "Make up something gross enough to be true",
  emoji: "\u{1FAB1}",
  colors: ["#7F9A6A", "#233020"],
  questions: [...q1, ...q2, ...q3, ...q4, ...q5],
};
