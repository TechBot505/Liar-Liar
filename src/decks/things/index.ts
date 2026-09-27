import type { Deck } from "../types";
import q1 from "./q1";
import q2 from "./q2";
import q3 from "./q3";
import q4 from "./q4";
import q5 from "./q5";
import q6 from "./q6";

export const deck: Deck = {
  id: "things",
  name: "Name That Thing",
  tagline: "Everything has a name — can you fake it?",
  description:
    "You're described an everyday thing or phenomenon that has a real, obscure name. Invent an official-sounding name to fool the table.",
  kind: "fact",
  lieHint: "Make up a fancy-sounding name that could be the real one.",
  emoji: "🔍",
  colors: ["#FFCC00", "#FF6B3D"],
  questions: [...q1, ...q2, ...q3, ...q4, ...q5, ...q6],
};

export default deck;
