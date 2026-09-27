import { describe, expect, it } from "vitest";
import { applyClientMessage, createRoom, handleDisconnect, tick } from "@/game/engine";
import type { ClientMessage } from "@/game/protocol";
import type { RoomState } from "@/game/types";
import { join, send } from "./helpers";

const NOW = 1000;

function joinRaw(state: RoomState, id: string, token: string): boolean {
  const msg: ClientMessage = {
    type: "join", playerId: id, token, name: "X", avatar: {}, seen: [],
  };
  return applyClientMessage(state, id, msg, NOW).effects.some((e) => e.type === "error");
}

describe("reconnect", () => {
  it("keeps the seat and score for the same playerId+token", () => {
    const state = createRoom("RCON", NOW);
    join(state, "p1", "Ann", NOW);
    join(state, "p2", "Bob", NOW);
    const p1 = state.players.find((p) => p.id === "p1");
    if (p1) p1.score = 5;
    handleDisconnect(state, "p1", NOW);
    expect(state.players.find((p) => p.id === "p1")?.connected).toBe(false);

    const res = join(state, "p1", "Ann", NOW);
    expect(res.effects.some((e) => e.type === "error")).toBe(false);
    const back = state.players.find((p) => p.id === "p1");
    expect(back?.connected).toBe(true);
    expect(back?.score).toBe(5);
  });

  it("rejects a mismatched token with seat_taken", () => {
    const state = createRoom("RC2", NOW);
    join(state, "p1", "Ann", NOW);
    const failed = joinRaw(state, "p1", "WRONG");
    expect(failed).toBe(true);
  });
});

describe("kick", () => {
  it("bans the token, removes the player, and blocks rejoin", () => {
    const state = createRoom("KICK", NOW);
    join(state, "p1", "Ann", NOW);
    join(state, "p2", "Bob", NOW);
    join(state, "p3", "Cy", NOW);

    const res = send(state, "p1", { type: "kick", playerId: "p2" }, NOW);
    expect(res.effects.some((e) => e.type === "kicked" && e.to === "p2")).toBe(true);
    expect(state.players.find((p) => p.id === "p2")).toBeUndefined();
    expect(state.bannedTokens).toContain("tok-p2");

    const rejoinFailed = joinRaw(state, "p2", "tok-p2");
    expect(rejoinFailed).toBe(true);

    const nonHost = send(state, "p3", { type: "kick", playerId: "p1" }, NOW);
    expect(nonHost.effects.some((e) => e.type === "error" && e.code === "host_only")).toBe(true);
  });
});

describe("host transfer", () => {
  it("transfers to the longest-connected player after 20s disconnected", () => {
    const state = createRoom("HOST", NOW);
    join(state, "p1", "Ann", NOW);
    join(state, "p2", "Bob", NOW + 50);
    expect(state.hostId).toBe("p1");

    handleDisconnect(state, "p1", NOW + 100);
    tick(state, NOW + 100 + 10000);
    expect(state.hostId).toBe("p1");
    tick(state, NOW + 100 + 21000);
    expect(state.hostId).toBe("p2");
  });

  it("transfers immediately on explicit leave", () => {
    const state = createRoom("LEAV", NOW);
    join(state, "p1", "Ann", NOW);
    join(state, "p2", "Bob", NOW + 50);
    send(state, "p1", { type: "leave" }, NOW + 100);
    expect(state.players.find((p) => p.id === "p1")).toBeUndefined();
    expect(state.hostId).toBe("p2");
  });
});
