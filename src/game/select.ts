import type { Deck, Question } from "@/decks/types";
import { seededShuffle } from "./rng";

/**
 * Build a game's question list per SPEC "Question selection":
 *  1. candidates = deck questions (minus adult ones under family mode, unless
 *     the whole deck is adult).
 *  2. prefer questions unseen by every joined player.
 *  3. top up with the least-seen (fewest players have seen it) candidates.
 *  4. seeded shuffle for round order and take N.
 */
export function selectQuestions(
  deck: Deck,
  n: number,
  seenLists: string[][],
  seed: string,
  familyMode: boolean,
): Question[] {
  const candidates = deck.questions.filter(
    (q) => !(familyMode && !deck.adult && q.adult),
  );

  const seenCount = new Map<string, number>();
  for (const list of seenLists) {
    // A player's seen list may contain dupes; count each player at most once.
    const unique = new Set(list);
    for (const id of unique) {
      seenCount.set(id, (seenCount.get(id) ?? 0) + 1);
    }
  }

  // Deterministic base order, then stable sort by how many players have seen it
  // so unseen (count 0) come first and ties keep the shuffled order.
  const shuffled = seededShuffle(candidates, seed);
  const ordered = shuffled
    .map((q, i) => ({ q, i, seen: seenCount.get(q.id) ?? 0 }))
    .sort((a, b) => a.seen - b.seen || a.i - b.i)
    .map((e) => e.q);

  const chosen = ordered.slice(0, Math.min(n, ordered.length));
  return seededShuffle(chosen, `${seed}:order`);
}
