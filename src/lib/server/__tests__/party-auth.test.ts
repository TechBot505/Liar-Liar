import { describe, expect, it } from "vitest";
import { checkPartySecret, timingSafeEqualStr } from "../party-auth";

describe("timingSafeEqualStr", () => {
  it("returns true for identical strings", () => {
    expect(timingSafeEqualStr("s3cret", "s3cret")).toBe(true);
  });

  it("returns false for different strings of equal length", () => {
    expect(timingSafeEqualStr("aaaaaa", "aaaaab")).toBe(false);
  });

  it("returns false for different lengths", () => {
    expect(timingSafeEqualStr("short", "longer-value")).toBe(false);
  });
});

describe("checkPartySecret", () => {
  it("matches a correct header", () => {
    expect(checkPartySecret("token", "token")).toBe(true);
  });

  it("rejects a wrong header", () => {
    expect(checkPartySecret("nope", "token")).toBe(false);
  });

  it("rejects when the header is missing", () => {
    expect(checkPartySecret(null, "token")).toBe(false);
    expect(checkPartySecret(undefined, "token")).toBe(false);
  });

  it("rejects when no secret is configured", () => {
    expect(checkPartySecret("token", undefined)).toBe(false);
    expect(checkPartySecret("token", "")).toBe(false);
  });
});
