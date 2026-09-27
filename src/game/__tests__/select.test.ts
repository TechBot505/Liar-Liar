import { describe, expect, it } from "vitest";
import { testFactDeck } from "@/decks/_test";
import { selectQuestions } from "@/game/select";

const ids = testFactDeck.questions.map((q) => q.id);

describe("selectQuestions", () => {
  it("returns N unique in-deck questions when enough are unseen", () => {
    const picked = selectQuestions(testFactDeck, 5, [], "TEST:1", true);
    expect(picked).toHaveLength(5);
    const set = new Set(picked.map((q) => q.id));
    expect(set.size).toBe(5);
    for (const q of picked) expect(ids).toContain(q.id);
  });

  it("is deterministic for identical inputs", () => {
    const a = selectQuestions(testFactDeck, 5, [], "TEST:1", true);
    const b = selectQuestions(testFactDeck, 5, [], "TEST:1", true);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });

  it("prefers unseen then tops up with the least-seen", () => {
    // ids 0..6 seen by 2 players, 7..8 seen by 1, 9..11 unseen.
    const p1 = ids.slice(0, 9); // 0..8
    const p2 = ids.slice(0, 7); // 0..6
    const picked = selectQuestions(testFactDeck, 5, [p1, p2], "TEST:1", true);
    const set = new Set(picked.map((q) => q.id));
    expect(set).toEqual(new Set([ids[9], ids[10], ids[11], ids[7], ids[8]]));
  });
});
