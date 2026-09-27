import { describe, expect, it } from "vitest";
import { isTooCloseToTruth, normalizeLie, tokenSetEqual } from "@/game/match";

describe("isTooCloseToTruth", () => {
  it("flags plural / near-identical forms", () => {
    expect(isTooCloseToTruth("hippos", "Hippo")).toBe(true);
  });

  it("flags article-only differences via token-set equality", () => {
    expect(isTooCloseToTruth("the hippo", "Hippo")).toBe(true);
  });

  it("flags single-character typos", () => {
    expect(isTooCloseToTruth("hipppo", "hippo")).toBe(true);
  });

  it("does not flag unrelated words", () => {
    expect(isTooCloseToTruth("giraffe", "hippo")).toBe(false);
  });

  it("matches accepted alternate spellings", () => {
    expect(isTooCloseToTruth("nyc", "New York City", ["NYC"])).toBe(true);
  });
});

describe("normalizeLie", () => {
  it("merges reordered, cased, articled duplicates", () => {
    expect(normalizeLie("The Big Dog")).toBe(normalizeLie("dog big"));
  });

  it("keeps distinct lies distinct", () => {
    expect(normalizeLie("blue whale")).not.toBe(normalizeLie("red fox"));
  });
});

describe("tokenSetEqual", () => {
  it("is order independent", () => {
    expect(tokenSetEqual("a b c", "c b a")).toBe(true);
    expect(tokenSetEqual("a b", "a b c")).toBe(false);
  });
});

import { displayText } from "@/game/engine/rounds";

describe("displayText (uniform option formatting)", () => {
  it("formats lies and truths identically", () => {
    expect(displayText("sand")).toBe("Sand");
    expect(displayText("  Glitter.  ")).toBe("Glitter");
    expect(displayText("iPhone")).toBe("iPhone");
    expect(displayText("NASA")).toBe("NASA");
    expect(displayText("a   baby  elephant")).toBe("A baby elephant");
  });
});
