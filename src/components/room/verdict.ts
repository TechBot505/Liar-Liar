import type { OptionResult, RoundResult } from "@/game/types";

/** Everything the verdict popup + results screen need about ONE player's round. */
export interface Verdict {
  /** What happened to you: found the truth, got fooled, or didn't vote. */
  outcome: "truth" | "fooled" | "novote";
  truthText: string;
  truthOption?: OptionResult;
  /** The option you voted for (undefined if you didn't vote). */
  pickedOption?: OptionResult;
  /** Authors of the lie you picked — who fooled you. */
  foolerIds: string[];
  /** Your own submitted lie option this round (undefined if you didn't submit). */
  yourLie?: OptionResult;
  /** Player ids who fell for your lie. */
  fooledIds: string[];
  /** Points you earned this round (already includes any final-round doubling). */
  roundPoints: number;
  /** Player-deck target view: you are the round's target. */
  isTarget: boolean;
  /** Player-deck: how many voters guessed your real answer, out of total voters. */
  guessedRight: number;
  voterTotal: number;
}

/** Derive one player's verdict from the reveal result. Pure — no leaks, since
 *  `result` only exists at reveal/scores (see engine/view.ts). */
export function deriveVerdict(result: RoundResult, youId: string): Verdict {
  const truthOption = result.options.find((o) => o.isTruth);
  const pickedOption = result.options.find((o) => o.voterIds.includes(youId));
  const yourLie = result.options.find((o) => !o.isTruth && o.authorIds.includes(youId));
  const isTarget = result.kind === "player" && result.targetId === youId;

  const outcome: Verdict["outcome"] = pickedOption
    ? pickedOption.isTruth
      ? "truth"
      : "fooled"
    : "novote";

  const voterTotal = result.options.reduce((n, o) => n + o.voterIds.length, 0);

  return {
    outcome,
    truthText: result.truthText,
    truthOption,
    pickedOption,
    foolerIds: pickedOption && !pickedOption.isTruth ? pickedOption.authorIds : [],
    yourLie,
    fooledIds: yourLie?.voterIds ?? [],
    roundPoints: result.scores[youId] ?? 0,
    isTarget,
    guessedRight: truthOption?.voterIds.length ?? 0,
    voterTotal,
  };
}

/** Lies sorted by number fooled (desc), truth excluded. For the results list. */
export function liesByImpact(result: RoundResult): OptionResult[] {
  return result.options
    .filter((o) => !o.isTruth)
    .sort((a, b) => b.voterIds.length - a.voterIds.length);
}
