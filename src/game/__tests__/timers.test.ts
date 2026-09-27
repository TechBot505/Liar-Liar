import { describe, expect, it } from "vitest";
import { applyClientMessage, createRoom, tick } from "@/game/engine";
import type { ApplyResult, Effect } from "@/game/engine";
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

function scheduleAt(effects: Effect[]): number | undefined {
  const e = effects.find((x) => x.type === "schedule");
  return e && e.type === "schedule" ? e.at : undefined;
}

/**
 * Faithful model of the PartyKit adapter's single alarm, which is only ever
 * moved *earlier* (party/server.ts `scheduleAlarm`). `fire()` runs `tick` at the
 * scheduled time and lets tick re-arm, exactly like `onAlarm`.
 */
class AlarmSim {
  alarm: number | null = null;
  constructor(private state: RoomState) {}
  schedule(at: number): void {
    if (this.alarm === null || at < this.alarm) this.alarm = at;
  }
  apply(res: ApplyResult): void {
    this.state = res.state;
    for (const e of res.effects) if (e.type === "schedule") this.schedule(e.at);
  }
  fire(): void {
    if (this.alarm === null) return;
    const at = this.alarm;
    this.alarm = null; // alarm is consumed when it fires, like the runtime
    this.apply(tick(this.state, at));
  }
}

describe("timer re-arm", () => {
  it("re-arms the active deadline when a stale early alarm fires", () => {
    const state = createRoom("TMR1", NOW);
    setup(state);
    const answerDeadline = state.round?.deadline ?? 0;

    // Submit late (near the answer deadline) so the voting deadline lands AFTER
    // the still-pending answering alarm — the case the "move-earlier-only" guard
    // suppresses.
    const late = NOW + 50_000;
    send(state, "p1", { type: "submitLie", text: "aaa" }, late);
    send(state, "p2", { type: "submitLie", text: "bbb" }, late);
    send(state, "p3", { type: "submitLie", text: "ccc" }, late);
    expect(state.phase).toBe("voting");
    const voteDeadline = state.round?.deadline ?? 0;
    expect(voteDeadline).toBeGreaterThan(answerDeadline);

    // The stale answering alarm fires; tick must NOT advance (voting isn't over)
    // but MUST re-arm the voting deadline so voting can still time out.
    const res = tick(state, answerDeadline);
    expect(state.phase).toBe("voting");
    expect(scheduleAt(res.effects)).toBe(voteDeadline);
  });

  it("never leaves a live phase without a pending alarm (full timer-only game)", () => {
    const state = createRoom("TMR2", NOW);
    setup(state);
    const sim = new AlarmSim(state);
    // Seed the sim with the answering alarm from startRound.
    sim.schedule(state.round?.deadline ?? 0);

    // Force a LATE early advance to voting so the answering alarm becomes stale
    // and the voting reschedule is suppressed (fires-earlier-only guard).
    const late = NOW + 50_000;
    send(state, "p1", { type: "submitLie", text: "aaa" }, late);
    send(state, "p2", { type: "submitLie", text: "bbb" }, late);
    send(state, "p3", { type: "submitLie", text: "ccc" }, late);
    expect(state.phase).toBe("voting");

    // Drive the game purely by alarms (nobody votes / advances). Without the
    // re-arm fix the alarm goes null after the stale wake and this loops forever.
    let guard = 0;
    while (state.phase !== "final") {
      expect(sim.alarm).not.toBeNull(); // a live phase always has an alarm queued
      sim.fire();
      if (++guard > 200) throw new Error("phase stuck — alarm was not re-armed");
    }
    expect(state.phase).toBe("final");
  });
});

describe("create is lobby-only", () => {
  it("rejects a create sent after the game has started", () => {
    const state = createRoom("CRE1", NOW);
    setup(state);
    expect(state.phase).toBe("answering");
    const before = state.settings.rounds;

    const res = applyClientMessage(
      state,
      "p1",
      { type: "create", settings: { ...factSettings, rounds: 10 } },
      NOW,
    );
    expect(res.effects.some((e) => e.type === "error" && e.code === "bad_phase")).toBe(true);
    expect(state.settings.rounds).toBe(before);
  });
});
