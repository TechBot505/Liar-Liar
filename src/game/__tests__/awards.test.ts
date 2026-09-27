import { describe, expect, it } from "vitest";
import { computeAwards } from "@/game/awards";
import type { OptionResult, RoundResult } from "@/game/types";

function round(
  index: number, options: OptionResult[], latencies: Record<string, number>,
): RoundResult {
  return {
    index, questionId: `_test:${index}`, prompt: "p", deckId: "_test",
    kind: "fact", truthText: "t", options, scores: {}, latencies,
  };
}

const history: RoundResult[] = [
  round(0, [
    { id: "l0", text: "x", authorIds: ["A"], isTruth: false, voterIds: ["B", "C"] },
    { id: "l1", text: "y", authorIds: ["B"], isTruth: false, voterIds: [] },
    { id: "truth", text: "t", authorIds: [], isTruth: true, voterIds: ["A"] },
  ], { A: 1000, B: 5000, C: 3000 }),
  round(1, [
    { id: "l0", text: "x", authorIds: ["A"], isTruth: false, voterIds: ["B"] },
    { id: "l1", text: "z", authorIds: ["C"], isTruth: false, voterIds: [] },
    { id: "truth", text: "t", authorIds: [], isTruth: true, voterIds: ["A", "C"] },
  ], { A: 1200, B: 6000, C: 2000 }),
];

describe("computeAwards", () => {
  const awards = computeAwards(history);
  const by = (id: string) => awards.find((a) => a.id === id);

  it("picks the biggest liar by total fooled", () => {
    expect(by("biggest_liar")).toMatchObject({ playerId: "A", value: 3 });
  });

  it("picks the human lie detector by truths found", () => {
    expect(by("lie_detector")).toMatchObject({ playerId: "A", value: 2 });
  });

  it("picks the most gullible by lies fallen for", () => {
    expect(by("most_gullible")).toMatchObject({ playerId: "B", value: 2 });
  });

  it("picks silver tongue by best single lie", () => {
    expect(by("silver_tongue")).toMatchObject({ playerId: "A", value: 2 });
  });

  it("names a nemesis pair", () => {
    expect(by("nemesis")).toMatchObject({ playerId: "A", secondaryPlayerId: "B", value: 2 });
  });

  it("skips awards with no clear winner (Honest to a Fault tie)", () => {
    expect(by("honest")).toBeUndefined();
  });

  // Was previously asserted to award Speed Demon (A) / Last-Second Larry (B).
  // The base fixture's avgs are A≈1.1s, B≈5.5s, C≈2.5s — a spread of only ~4.4s,
  // below the meaningful-contrast bar (≥8s, or ≥25% of the answer timer). That
  // near-tie winning a stat-based pair is exactly bug #6, so the correct
  // behavior is to emit NEITHER award here.
  it("suppresses speed awards when the spread is too small", () => {
    expect(by("speed_demon")).toBeUndefined();
    expect(by("last_second")).toBeUndefined();
  });
});

// Dedicated latency fixture with a genuine contrast on a 30s answer timer:
// F≈2s (fast), M≈10s, S≈20s (ran the clock down). Spread 18s clears the bar and
// S's avg clears 60% of the timer (18s), so both awards fire.
const speedHistory: RoundResult[] = [
  round(0, [
    { id: "t", text: "t", authorIds: [], isTruth: true, voterIds: [] },
  ], { F: 2000, M: 10000, S: 20000 }),
  round(1, [
    { id: "t", text: "t", authorIds: [], isTruth: true, voterIds: [] },
  ], { F: 2000, M: 10000, S: 20000 }),
];

describe("computeAwards latency gating", () => {
  it("awards Speed Demon + Last-Second Larry on a real spread", () => {
    const awards = computeAwards(speedHistory, 30);
    const by = (id: string) => awards.find((a) => a.id === id);
    expect(by("speed_demon")).toMatchObject({ playerId: "F", value: 2000 });
    expect(by("last_second")).toMatchObject({ playerId: "S", value: 20000 });
  });

  it("still awards Speed Demon but not Larry when nobody nears the timer", () => {
    // Same big spread, but a 90s timer means S's 20s avg is < 60% (54s).
    const awards = computeAwards(speedHistory, 90);
    const by = (id: string) => awards.find((a) => a.id === id);
    expect(by("speed_demon")).toMatchObject({ playerId: "F" });
    expect(by("last_second")).toBeUndefined();
  });

  it("emits no latency awards with fewer than 3 submitters", () => {
    const awards = computeAwards(
      [round(0, [], { F: 2000, S: 20000 })],
      30,
    );
    expect(awards.find((a) => a.id === "speed_demon")).toBeUndefined();
    expect(awards.find((a) => a.id === "last_second")).toBeUndefined();
  });

  it("emits no latency awards when the three avgs tie", () => {
    const tie: RoundResult[] = [round(0, [], { F: 5000, M: 5000, S: 5000 })];
    const awards = computeAwards(tie, 30);
    expect(awards.find((a) => a.id === "speed_demon")).toBeUndefined();
    expect(awards.find((a) => a.id === "last_second")).toBeUndefined();
  });
});
