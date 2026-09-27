import type { Deck } from "../types";
import { q1 } from "./q1";
import { q2 } from "./q2";
import { q3 } from "./q3";
import { q4 } from "./q4";
import { q5 } from "./q5";
import { q6 } from "./q6";

export const deck: Deck = {
  id: "movies",
  name: "Plot Twist",
  tagline: "Weird-but-true movie secrets — invent one that fools everyone.",
  description:
    "Strange true behind-the-scenes facts and trivia from famous movies and TV, Hollywood to Bollywood. Fill in the blank with a fake that sounds just as real.",
  kind: "fact",
  lieHint: "Write a fake movie fact that sounds like real trivia.",
  emoji: "🎬",
  colors: ["#FF3B3B", "#8A2BE2"],
  questions: [...q1, ...q2, ...q3, ...q4, ...q5, ...q6],
};

export default deck;
