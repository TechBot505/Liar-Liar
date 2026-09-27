import type { Deck } from "../types";
import { questions as q1 } from "./q1";
import { questions as q2 } from "./q2";
import { questions as q3 } from "./q3";
import { questions as q4 } from "./q4";
import { questions as q5 } from "./q5";

export const deck: Deck = {
  id: "history",
  name: "History Is Weird",
  tagline: "Real history is stranger than anything you can invent.",
  description:
    "Guess the true detail from the past -- or bluff one so plausible that history seems to back you up.",
  kind: "fact",
  lieHint: "Write a fake answer that sounds TRUE.",
  emoji: "\u{1F3DB}\u{FE0F}",
  colors: ["#7C5CFF", "#29D3C3"],
  questions: [...q1, ...q2, ...q3, ...q4, ...q5],
};
