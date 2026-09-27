import { describe, expect, it } from "vitest";
import { scoreRound } from "@/game/scoring";

describe("scoreRound — fact", () => {
  it("awards +2 for truth and +1 per fooled voter", () => {
    const scores = scoreRound({
      kind: "fact",
      doubleFinal: false,
      options: [
        { authorIds: ["A"], isTruth: false, voterIds: ["B", "C"] },
        { authorIds: ["B"], isTruth: false, voterIds: [] },
        { authorIds: ["C"], isTruth: false, voterIds: [] },
        { authorIds: [], isTruth: true, voterIds: ["A"] },
      ],
    });
    // A: +2 for truth, +2 for fooling B and C. B and C earn nothing → absent.
    expect(scores).toEqual({ A: 4 });
  });

  it("credits merged authors each per fooled voter", () => {
    const scores = scoreRound({
      kind: "fact",
      doubleFinal: false,
      options: [
        { authorIds: ["A", "B"], isTruth: false, voterIds: ["C", "D"] },
        { authorIds: [], isTruth: true, voterIds: [] },
      ],
    });
    expect(scores).toEqual({ A: 2, B: 2 });
  });

  it("doubles points on the final round", () => {
    const scores = scoreRound({
      kind: "fact",
      doubleFinal: true,
      options: [
        { authorIds: ["A"], isTruth: false, voterIds: ["B"] },
        { authorIds: [], isTruth: true, voterIds: ["C"] },
      ],
    });
    expect(scores).toEqual({ A: 2, C: 4 });
  });
});

describe("scoreRound — player", () => {
  it("gives finders +2, authors +1, target +1 per finder", () => {
    const scores = scoreRound({
      kind: "player",
      targetId: "T",
      doubleFinal: false,
      options: [
        { authorIds: ["A"], isTruth: false, voterIds: ["Y"] },
        { authorIds: [], isTruth: true, voterIds: ["X", "Z"] },
      ],
    });
    expect(scores).toEqual({ A: 1, X: 2, Z: 2, T: 2 });
  });
});
