import type { Deck } from "../types";
import { questions as q1 } from "./q1";
import { questions as q2 } from "./q2";
import { questions as q3 } from "./q3";
import { questions as q4 } from "./q4";
import { questions as q5 } from "./q5";
import { questions as q6 } from "./q6";

export const deck: Deck = {
  id: "laws",
  name: "Actually Illegal",
  tagline: "Real laws so unhinged your best lie sounds tame.",
  description:
    "Fill in the blank on a genuinely real law, ruling or lawsuit -- or invent a fake one convincing enough to fool the room.",
  kind: "fact",
  lieHint: "Write a fake law that sounds real.",
  emoji: "\u2696\uFE0F",
  colors: ["#8C7A5B", "#3A3226"],
  questions: [...q1, ...q2, ...q3, ...q4, ...q5, ...q6],
};
