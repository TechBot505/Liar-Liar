import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, resetRateLimits } from "../ratelimit";

describe("rateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("allows up to the limit within a window", () => {
    const t0 = 1_000;
    expect(rateLimit("k", 3, 1000, t0).ok).toBe(true);
    expect(rateLimit("k", 3, 1000, t0).ok).toBe(true);
    const third = rateLimit("k", 3, 1000, t0);
    expect(third.ok).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("blocks once the limit is exceeded", () => {
    const t0 = 1_000;
    for (let i = 0; i < 3; i++) rateLimit("k", 3, 1000, t0);
    expect(rateLimit("k", 3, 1000, t0).ok).toBe(false);
  });

  it("resets after the window elapses", () => {
    const t0 = 1_000;
    for (let i = 0; i < 3; i++) rateLimit("k", 3, 1000, t0);
    expect(rateLimit("k", 3, 1000, t0).ok).toBe(false);
    // A hit after resetAt starts a fresh window.
    expect(rateLimit("k", 3, 1000, t0 + 1000).ok).toBe(true);
  });

  it("tracks keys independently", () => {
    const t0 = 1_000;
    rateLimit("a", 1, 1000, t0);
    expect(rateLimit("a", 1, 1000, t0).ok).toBe(false);
    expect(rateLimit("b", 1, 1000, t0).ok).toBe(true);
  });
});
