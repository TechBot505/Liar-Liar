import type { Deck, Question } from "../types";

/**
 * Tiny synthetic decks used by unit tests and to let the server/select boot
 * before the real deck content lands. NOT real content — safe to keep shipped
 * behind the `_test` id (the registry filters or the picker can hide it later).
 */

function factQ(n: number, prompt: string, answer: string, alts?: string[]): Question {
  return { id: `_test:${String(n).padStart(3, "0")}`, prompt, answer, alts };
}

const factQuestions: Question[] = [
  factQ(1, "The largest land animal is the ____", "elephant", ["african elephant"]),
  factQ(2, "The chemical symbol for gold is ____", "Au"),
  factQ(3, "The tallest mountain on Earth is ____", "Everest", ["mount everest"]),
  factQ(4, "A group of lions is called a ____", "pride"),
  factQ(5, "The fastest land animal is the ____", "cheetah"),
  factQ(6, "The smallest planet is ____", "Mercury"),
  factQ(7, "Honey never ____", "spoils", ["goes bad"]),
  factQ(8, "The largest ocean is the ____", "Pacific", ["pacific ocean"]),
  factQ(9, "A baby kangaroo is called a ____", "joey"),
  factQ(10, "The hardest natural substance is ____", "diamond"),
  factQ(11, "The currency of Japan is the ____", "yen"),
  factQ(12, "The study of birds is called ____", "ornithology"),
];

export const testFactDeck: Deck = {
  id: "_test",
  name: "Test Facts",
  tagline: "For tests only",
  description: "Synthetic fact deck used by the engine test-suite.",
  kind: "fact",
  lieHint: "Write a fake fact that sounds true",
  emoji: "🧪",
  colors: ["#111827", "#4f46e5"],
  questions: factQuestions,
};

function playerQ(n: number, prompt: string): Question {
  return { id: `_testp:${String(n).padStart(3, "0")}`, prompt, answer: "" };
}

const playerQuestions: Question[] = [
  playerQ(1, "What is {target}'s secret talent?"),
  playerQ(2, "What did {target} do that they never told anyone?"),
  playerQ(3, "What is {target}'s most irrational fear?"),
  playerQ(4, "What is the weirdest thing in {target}'s bag?"),
  playerQ(5, "What is {target}'s guilty pleasure?"),
  playerQ(6, "What is {target}'s worst habit?"),
];

export const testPlayerDeck: Deck = {
  id: "_testp",
  name: "Test Truth Comes Out",
  tagline: "For tests only",
  description: "Synthetic player deck used by the engine test-suite.",
  kind: "player",
  lieHint: "Write a lie that sounds like the target",
  emoji: "🎭",
  colors: ["#7c3aed", "#db2777"],
  questions: playerQuestions,
};
