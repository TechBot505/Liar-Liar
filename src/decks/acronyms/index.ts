import type { Deck } from "../types";
import q1 from "./q1";
import q2 from "./q2";
import q3 from "./q3";
import q4 from "./q4";
import q5 from "./q5";

export const deck: Deck = {
  id: "acronyms",
  name: "Stands For What?",
  tagline: "Every letter hides a lie.",
  description:
    "You're given a familiar acronym. Make up what its letters 'really' stand for and see who buys it.",
  kind: "fact",
  lieHint: "Invent an expansion that sounds official and plausible.",
  emoji: "🔤",
  colors: ["#22D67A", "#00A6FF"],
  questions: [...q1, ...q2, ...q3, ...q4, ...q5],
};

export default deck;
