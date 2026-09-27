import type { Deck } from "../types";
import { questions as q1 } from "./q1";
import { questions as q2 } from "./q2";
import { questions as q3 } from "./q3";
import { questions as q4 } from "./q4";
import { questions as q5 } from "./q5";
import { questions as q6 } from "./q6";

export const deck: Deck = {
  id: "wtf",
  name: "Wait, That's Real?",
  tagline: "The most random real things on Earth -- reality out-weirds you.",
  description:
    "Fill in the blank with the true detail from the world's most absurd facts -- or bluff one so dumb it just might pass for real.",
  kind: "fact",
  lieHint: "Invent something too dumb to be real.",
  emoji: "\u{1F92F}",
  colors: ["#9A6A8F", "#2E1F2B"],
  questions: [...q1, ...q2, ...q3, ...q4, ...q5, ...q6],
};
