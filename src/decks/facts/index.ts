import type { Deck } from "../types";
import { questions as q1 } from "./q1";
import { questions as q2 } from "./q2";
import { questions as q3 } from "./q3";
import { questions as q4 } from "./q4";
import { questions as q5 } from "./q5";

export const deck: Deck = {
  id: "facts",
  name: "Is That a Fact?",
  tagline: "The truth is weirder than your best lie.",
  description:
    "Fill in the blank with the real fact -- or a fake one convincing enough to fool the room.",
  kind: "fact",
  lieHint: "Write a fake answer that sounds TRUE.",
  emoji: "\u{1F913}",
  colors: ["#FF5C8A", "#FFB84D"],
  questions: [...q1, ...q2, ...q3, ...q4, ...q5],
};
