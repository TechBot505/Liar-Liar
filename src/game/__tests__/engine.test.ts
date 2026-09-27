import { describe, expect, it } from "vitest";
import { createRoom, viewFor } from "@/game/engine";
import type { ApplyResult } from "@/game/engine";
import type { RoomState } from "@/game/types";
import { factSettings, join, playerSettings, send } from "./helpers";

const NOW = 1000;

function setup(state: RoomState): void {
  join(state, "p1", "Ann", NOW);
  join(state, "p2", "Bob", NOW);
  join(state, "p3", "Cy", NOW);
  send(state, "p1", { type: "create", settings: factSettings }, NOW);
  send(state, "p1", { type: "start" }, NOW);
}

/** Advance one full round from whatever phase the state is currently in. */
function playRound(state: RoomState, ids: string[]): ApplyResult | null {
  let last: ApplyResult | null = null;
  if (state.phase === "answering") {
    ids.forEach((id, i) =>
      (last = send(state, id, { type: "submitLie", text: `lie-${state.round?.index}-${i}` }, NOW)));
  }
  if (state.phase === "voting") {
    const truthId = state.round?.options.find((o) => o.isTruth)?.id ?? "";
    const target = state.round?.kind === "player" ? state.round.targetId : undefined;
    for (const id of ids) {
      if (id === target) continue;
      last = send(state, id, { type: "vote", optionId: truthId }, NOW);
    }
  }
  if (state.phase === "reveal") last = send(state, ids[0], { type: "next" }, NOW);
  if (state.phase === "scores") last = send(state, ids[0], { type: "next" }, NOW);
  return last;
}

describe("engine — full fact game", () => {
  it("plays 3 players to final without leaking secrets", () => {
    const state = createRoom("ABCD", NOW);
    setup(state);
    expect(state.phase).toBe("answering");

    send(state, "p1", { type: "submitLie", text: "purplemonkey" }, NOW);
    send(state, "p2", { type: "submitLie", text: "flyingcarpet" }, NOW);
    const spy = viewFor(state, "p3", NOW);
    expect(spy.round?.options).toBeUndefined();
    expect(JSON.stringify(spy)).not.toMatch(/purplemonkey|flyingcarpet/);

    send(state, "p3", { type: "submitLie", text: "bananaphone" }, NOW);
    expect(state.phase).toBe("voting");

    const pv = viewFor(state, "p1", NOW);
    expect(JSON.stringify(pv.round?.options)).not.toContain("isTruth");
    const own = pv.round?.yourLieOptionId;
    expect(own).toBeDefined();

    const bad = send(state, "p1", { type: "vote", optionId: own ?? "" }, NOW);
    expect(bad.effects.some((e) => e.type === "error" && e.code === "own_lie")).toBe(true);

    let over = false;
    while (state.phase !== "final") {
      const res = playRound(state, ["p1", "p2", "p3"]);
      if (res?.effects.some((e) => e.type === "gameOver")) over = true;
    }
    expect(over).toBe(true);
    expect(state.final?.standings).toHaveLength(3);
    expect(state.history).toHaveLength(5);
  });

  it("early-advances answering when all connected players submit", () => {
    const state = createRoom("EARL", NOW);
    setup(state);
    send(state, "p1", { type: "submitLie", text: "aaa" }, NOW);
    send(state, "p2", { type: "submitLie", text: "bbb" }, NOW);
    expect(state.phase).toBe("answering");
    send(state, "p3", { type: "submitLie", text: "ccc" }, NOW);
    expect(state.phase).toBe("voting");
  });
});

describe("engine — player deck", () => {
  it("target writes the truth and cannot vote", () => {
    const state = createRoom("PLAY", NOW);
    join(state, "p1", "Ann", NOW);
    join(state, "p2", "Bob", NOW);
    join(state, "p3", "Cy", NOW);
    send(state, "p1", { type: "create", settings: playerSettings }, NOW);
    send(state, "p1", { type: "start" }, NOW);

    expect(state.round?.kind).toBe("player");
    const target = state.round?.targetId ?? "";
    const others = ["p1", "p2", "p3"].filter((id) => id !== target);

    send(state, target, { type: "submitLie", text: "my real secret" }, NOW);
    send(state, others[0], { type: "submitLie", text: "fake one" }, NOW);
    send(state, others[1], { type: "submitLie", text: "fake two" }, NOW);
    expect(state.phase).toBe("voting");
    expect(state.round?.truthText).toBe("my real secret");

    const truthId = state.round?.options.find((o) => o.isTruth)?.id ?? "";
    const denied = send(state, target, { type: "vote", optionId: truthId }, NOW);
    expect(denied.effects.some((e) => e.type === "error" && e.code === "target_no_vote")).toBe(true);

    send(state, others[0], { type: "vote", optionId: truthId }, NOW);
    send(state, others[1], { type: "vote", optionId: truthId }, NOW);
    expect(state.phase).toBe("reveal");
    // both finders +2, target +1 per finder = +2.
    const scores = state.round?.result?.scores ?? {};
    expect(scores[target]).toBe(2);
  });
});
