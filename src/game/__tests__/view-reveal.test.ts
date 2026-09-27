import { describe, expect, it } from "vitest";
import { createRoom, viewFor } from "@/game/engine";
import { revealMs } from "@/game/engine/constants";
import type { RoomState } from "@/game/types";
import { factSettings, join, send } from "./helpers";

const NOW = 1000;

function setup(state: RoomState): void {
  join(state, "p1", "Ann", NOW);
  join(state, "p2", "Bob", NOW);
  join(state, "p3", "Cy", NOW);
  send(state, "p1", { type: "create", settings: factSettings }, NOW);
  send(state, "p1", { type: "start" }, NOW);
}

describe("viewFor — reveal-only result data", () => {
  it("never exposes voterIds/authorIds/isTruth before reveal", () => {
    const state = createRoom("VIEW", NOW);
    setup(state);

    // Answering: no options, no result at all.
    const answering = viewFor(state, "p1", NOW);
    expect(answering.round?.options).toBeUndefined();
    expect(answering.round?.result).toBeUndefined();

    send(state, "p1", { type: "submitLie", text: "aaa" }, NOW);
    send(state, "p2", { type: "submitLie", text: "bbb" }, NOW);
    send(state, "p3", { type: "submitLie", text: "ccc" }, NOW);
    expect(state.phase).toBe("voting");

    // Voting: options carry only {id,text} — no voterIds/authorIds/isTruth/result.
    const voting = viewFor(state, "p1", NOW);
    expect(voting.round?.result).toBeUndefined();
    const optKeys = Object.keys(voting.round?.options?.[0] ?? {}).sort();
    expect(optKeys).toEqual(["id", "text"]);
    expect(JSON.stringify(voting.round)).not.toMatch(/voterIds|authorIds|isTruth/);

    // Vote everyone to the truth to reach reveal.
    const truthId = state.round?.options.find((o) => o.isTruth)?.id ?? "";
    send(state, "p1", { type: "vote", optionId: truthId }, NOW);
    send(state, "p2", { type: "vote", optionId: truthId }, NOW);
    send(state, "p3", { type: "vote", optionId: truthId }, NOW);
    expect(state.phase).toBe("reveal");

    // Reveal: result now exposes the per-option authorIds/voterIds/isTruth the
    // verdict popup + results screen consume.
    const reveal = viewFor(state, "p1", NOW);
    const opt = reveal.round?.result?.options[0];
    expect(opt).toBeDefined();
    expect(opt).toHaveProperty("voterIds");
    expect(opt).toHaveProperty("authorIds");
    expect(opt).toHaveProperty("isTruth");
    expect(reveal.round?.result?.scores).toBeDefined();
  });

  it("uses the widened reveal window (min 40s, 6s*opts + 8s)", () => {
    expect(revealMs(3)).toBe(26000);
    expect(revealMs(10)).toBe(40000);
  });
});
