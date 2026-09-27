import type { Deck } from "../types";
import q1 from "./q1";
import q2 from "./q2";
import q3 from "./q3";
import q4 from "./q4";
import q5 from "./q5";
import q6 from "./q6";

export const deck: Deck = {
  id: "words",
  name: "Dictionary Dash",
  tagline: "Real words. Fake meanings. Total nonsense.",
  description:
    "You're shown a real, ridiculous-sounding word. Write a definition convincing enough to fool everyone at the table.",
  kind: "fact",
  lieHint: "Invent a definition that sounds like it belongs in a dictionary.",
  emoji: "📖",
  colors: ["#00C2FF", "#6B5CFF"],
  questions: [...q1, ...q2, ...q3, ...q4, ...q5, ...q6],
};

export default deck;
