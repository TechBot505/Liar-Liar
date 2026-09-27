import type { Deck } from "../types";
import { questions as q1 } from "./q1";
import { questions as q2 } from "./q2";
import { questions as q3 } from "./q3";
import { questions as q4 } from "./q4";
import { questions as q5 } from "./q5";
import { questions as q6 } from "./q6";
import { questions as q7 } from "./q7";
import { questions as q8 } from "./q8";

export const deck: Deck = {
  id: "headlines",
  name: "Florida Man & Friends",
  tagline: "Real headlines. You can't make this stuff up -- but try.",
  description:
    "Finish the bizarre-but-true news headline. The real ending is stranger than anything you'll invent -- so make yours unhinged.",
  kind: "fact",
  lieHint: "Finish the headline with something unhinged.",
  emoji: "\u{1F4F0}",
  colors: ["#6F8FA6", "#1F2A33"],
  questions: [...q1, ...q2, ...q3, ...q4, ...q5, ...q6, ...q7, ...q8],
};
