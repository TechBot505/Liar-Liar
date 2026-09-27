import { describe, expect, it } from "vitest";
import { DECKS } from "@/decks/registry";

// Guards the hand-written deck content: shape, id uniqueness and prompt format.
describe("deck content", () => {
  it("has unique deck ids", () => {
    const ids = DECKS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const deck of DECKS) {
    describe(deck.id, () => {
      it("has at least 100 questions", () => {
        expect(deck.questions.length).toBeGreaterThanOrEqual(100);
      });

      it("has unique, correctly prefixed question ids", () => {
        const ids = deck.questions.map((q) => q.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const id of ids) expect(id.startsWith(`${deck.id}:`)).toBe(true);
      });

      it("has exactly one blank per prompt", () => {
        for (const q of deck.questions) {
          expect(q.prompt.split("____").length - 1, q.id).toBe(1);
        }
      });

      it("matches its kind", () => {
        for (const q of deck.questions) {
          if (deck.kind === "fact") {
            expect(q.answer.trim().length, q.id).toBeGreaterThan(0);
            expect(q.answer.length, q.id).toBeLessThanOrEqual(60);
          } else {
            expect(q.answer, q.id).toBe("");
            expect(q.prompt.includes("{target}"), q.id).toBe(true);
          }
        }
      });
    });
  }
});
