import type * as Party from "partykit/server";
import { parseClientMessage } from "../src/game/protocol";
import type { ClientMessage, ServerMessage } from "../src/game/protocol";
import {
  applyClientMessage, createRoom, type Effect, handleDisconnect, tick, viewFor,
} from "../src/game/engine";
import type { GameRecord, RoomState } from "../src/game/types";

const MAX_MESSAGE_BYTES = 4096;
const STORAGE_KEY = "room";
const CODE_KEY = "code";
const HOST_GRACE_MS = 20000;
const POST_TIMEOUT_MS = 8000;

/** Thin PartyKit adapter: wires WebSocket connections and timers to the pure engine. */
export default class LiarLiarServer implements Party.Server {
  private state: RoomState | null = null;
  private readonly connToPlayer = new Map<string, string>();
  private readonly playerToConn = new Map<string, string>();

  // Do NOT read room.id here: on an alarm-triggered (re)init it is unavailable
  // and throws, crashing the worker. State is created lazily in onStart/first use.
  constructor(readonly room: Party.Room) {}

  async onStart(): Promise<void> {
    try {
      const saved = await this.room.storage.get<RoomState>(STORAGE_KEY);
      if (saved) this.state = saved;
      await this.persistCode(); // room.id is available here; persist for onAlarm.
    } catch (err) {
      console.error("onStart failed", err);
    }
  }

  onConnect(): void {
    // Identity unknown until `join`; room.id is available, so refresh the code.
    void this.persistCode();
  }

  async onMessage(message: string | ArrayBuffer | ArrayBufferView, sender: Party.Connection): Promise<void> {
    if (typeof message !== "string" || message.length > MAX_MESSAGE_BYTES) return;
    const msg = parseClientMessage(message);
    if (!msg) return;
    const now = Date.now();
    try {
      const state = await this.ensureState(now);
      if (msg.type === "join") {
        const result = applyClientMessage(state, msg.playerId, msg, now);
        if (!result.effects.some((e) => e.type === "error")) {
          this.connToPlayer.set(sender.id, msg.playerId);
          this.playerToConn.set(msg.playerId, sender.id);
        }
        this.state = result.state;
        await this.runEffects(result.state, result.effects, now, sender);
        return;
      }
      const playerId = this.connToPlayer.get(sender.id);
      if (!playerId) return;
      const result = applyClientMessage(state, playerId, msg as ClientMessage, now);
      this.state = result.state;
      await this.runEffects(result.state, result.effects, now, sender);
    } catch (err) {
      console.error("onMessage failed", err);
    }
  }

  async onClose(conn: Party.Connection): Promise<void> {
    const playerId = this.connToPlayer.get(conn.id);
    this.connToPlayer.delete(conn.id);
    if (!playerId || this.playerToConn.get(playerId) !== conn.id) return;
    this.playerToConn.delete(playerId);
    const now = Date.now();
    try {
      const state = await this.ensureState(now);
      const result = handleDisconnect(state, playerId, now);
      this.state = result.state;
      await this.scheduleAlarm(now + HOST_GRACE_MS + 500);
      await this.runEffects(result.state, result.effects, now);
    } catch (err) {
      console.error("onClose failed", err);
    }
  }

  async onAlarm(): Promise<void> {
    try {
      let state = this.state;
      if (!state) {
        const saved = await this.room.storage.get<RoomState>(STORAGE_KEY);
        if (!saved) return; // No persisted game to advance — no-op.
        state = saved;
        this.state = saved;
      }
      const now = Date.now();
      // A fired alarm is already cleared, so tick's re-arm schedules correctly.
      const result = tick(state, now);
      this.state = result.state;
      await this.runEffects(result.state, result.effects, now);
    } catch (err) {
      console.error("onAlarm failed", err);
    }
  }

  private async ensureState(now: number): Promise<RoomState> {
    if (this.state) return this.state;
    const saved = await this.room.storage.get<RoomState>(STORAGE_KEY);
    this.state = saved ?? createRoom(await this.resolveCode(), now);
    return this.state;
  }

  private async resolveCode(): Promise<string> {
    try {
      if (this.room.id) return this.room.id;
    } catch (err) {
      console.error("room.id unavailable", err);
    }
    return (await this.room.storage.get<string>(CODE_KEY)) ?? "";
  }

  private async persistCode(): Promise<void> {
    try {
      const code = await this.resolveCode();
      if (code) await this.room.storage.put(CODE_KEY, code);
    } catch (err) {
      console.error("persistCode failed", err);
    }
  }

  private async runEffects(
    state: RoomState, effects: Effect[], now: number, sender?: Party.Connection,
  ): Promise<void> {
    let dirty = false;
    for (const e of effects) {
      switch (e.type) {
        case "broadcast": this.broadcastState(state, now); dirty = true; break;
        case "schedule": await this.scheduleAlarm(e.at); break;
        case "error": this.sendTo(e.to, { type: "error", code: e.code, message: e.message }, sender); break;
        case "pong": this.sendTo(e.to, { type: "pong", now: e.now }, sender); break;
        case "reaction":
          this.room.broadcast(JSON.stringify({ type: "reaction", playerId: e.playerId, emoji: e.emoji }));
          break;
        case "kicked": this.sendTo(e.to, { type: "kicked" }, sender); dirty = true; break;
        case "gameOver": dirty = true; await this.postRecord(state, e.record); break;
      }
    }
    if (dirty) await this.room.storage.put(STORAGE_KEY, state);
  }

  private broadcastState(state: RoomState, now: number): void {
    for (const conn of this.room.getConnections()) {
      const playerId = this.connToPlayer.get(conn.id);
      if (!playerId) continue;
      conn.send(JSON.stringify({ type: "state", view: viewFor(state, playerId, now) } satisfies ServerMessage));
    }
  }

  private sendTo(playerId: string, msg: ServerMessage, fallback?: Party.Connection): void {
    const connId = this.playerToConn.get(playerId);
    const conn = connId ? this.room.getConnection(connId) : undefined;
    (conn ?? fallback)?.send(JSON.stringify(msg));
  }

  private async scheduleAlarm(at: number): Promise<void> {
    const existing = await this.room.storage.getAlarm();
    if (existing === null || at < existing) await this.room.storage.setAlarm(at);
  }

  /** POST the finished game: awaited, 8s AbortController timeout, one retry, never throws. */
  private async postRecord(state: RoomState, record: GameRecord): Promise<void> {
    const appUrl = this.room.env.NEXT_PUBLIC_APP_URL as string | undefined;
    const secret = this.room.env.PARTY_SECRET as string | undefined;
    if (!appUrl || !secret) return;
    let body: string;
    try {
      body = JSON.stringify({ ...record, players: await this.fillTokenHashes(state, record.players) });
    } catch (err) {
      console.error("postRecord: failed to build payload", err);
      return;
    }
    for (let attempt = 1; attempt <= 2; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), POST_TIMEOUT_MS);
      try {
        const res = await fetch(`${appUrl}/api/games`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-party-secret": secret },
          body,
          signal: controller.signal,
        });
        if (res.ok) return;
        console.error(`postRecord: HTTP ${res.status} on attempt ${attempt}`);
      } catch (err) {
        console.error(`postRecord: attempt ${attempt} failed`, err);
      } finally {
        clearTimeout(timer);
      }
    }
  }

  private async fillTokenHashes(
    state: RoomState, players: GameRecord["players"],
  ): Promise<GameRecord["players"]> {
    return Promise.all(players.map(async (p) => {
      const token = state.players.find((sp) => sp.id === p.seatId)?.token;
      return token ? { ...p, tokenHash: await sha256(token) } : p;
    }));
  }
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
