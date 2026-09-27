import type { Deck } from "../types";
import { q1 } from "./q1";
import { q2 } from "./q2";
import { q3 } from "./q3";
import { q4 } from "./q4";
import { q5 } from "./q5";
import { q6 } from "./q6";

export const deck: Deck = {
  id: "desi",
  name: "Desi Bluff",
  tagline: "Real facts about India — can you fake one convincingly?",
  description:
    "Surprising-but-true facts about India: food, Bollywood, cricket, history, geography, trains, languages and world records. Write a fake fill-in that sounds just as real.",
  kind: "fact",
  lieHint: "Write a fake answer that sounds like a genuine Indian fact.",
  emoji: "🇮🇳",
  colors: ["#FF7A00", "#FF2D7A"],
  questions: [...q1, ...q2, ...q3, ...q4, ...q5, ...q6],
};

export default deck;
