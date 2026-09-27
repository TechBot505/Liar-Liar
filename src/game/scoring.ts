import type { DeckKind } from "@/decks/types";

/** Minimal option shape scoring needs — engine passes the resolved round options. */
export interface ScoreOption {
  authorIds: string[];
  isTruth: boolean;
  voterIds: string[];
}

export interface ScoreInput {
  kind: DeckKind;
  /** Present for `player` decks: the player whose real answer is the truth. */
  targetId?: string;
  options: ScoreOption[];
  /** When true this round's points are doubled (final round + doubleFinal setting). */
  doubleFinal: boolean;
}

/**
 * Score a single round per SPEC "Scoring".
 *
 * Fact decks:
 *  - +2 to each voter who picks the truth.
 *  - +1 to each author (merged authors all count) per voter who picks their lie.
 *
 * Player ("Truth Comes Out") decks:
 *  - +2 to each voter who finds the target's real answer (the truth).
 *  - +1 to each lie author per fooled voter.
 *  - +1 to the target per voter who found their real answer.
 *
 * Final round points are doubled when `doubleFinal` is set. Returns per-player
 * score deltas (only players who earned points appear).
 */
export function scoreRound(input: ScoreInput): Record<string, number> {
  const scores: Record<string, number> = {};
  const add = (id: string, pts: number): void => {
    if (pts === 0) return;
    scores[id] = (scores[id] ?? 0) + pts;
  };

  for (const opt of input.options) {
    if (opt.isTruth) {
      for (const voter of opt.voterIds) add(voter, 2);
      if (input.kind === "player" && input.targetId) {
        add(input.targetId, opt.voterIds.length);
      }
    } else {
      for (const author of opt.authorIds) add(author, opt.voterIds.length);
    }
  }

  if (input.doubleFinal) {
    for (const id of Object.keys(scores)) scores[id] *= 2;
  }
  return scores;
}
