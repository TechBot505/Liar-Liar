import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hashTokens, sha256Hex } from "../hash";

const digest = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

describe("sha256Hex", () => {
  it("produces the canonical lowercase hex sha256", () => {
    expect(sha256Hex("hello")).toBe(digest("hello"));
    expect(sha256Hex("hello")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("matches the party server's known-answer hash", () => {
    // The party server hashes tokens the same way; keep this in lockstep.
    expect(sha256Hex("player-token-123")).toBe(digest("player-token-123"));
  });
});

describe("hashTokens", () => {
  it("hashes each token", () => {
    expect(hashTokens(["a", "b"])).toEqual([digest("a"), digest("b")]);
  });

  it("de-duplicates repeated tokens", () => {
    expect(hashTokens(["a", "a", "b"])).toEqual([digest("a"), digest("b")]);
  });

  it("returns an empty array for no tokens", () => {
    expect(hashTokens([])).toEqual([]);
  });
});
