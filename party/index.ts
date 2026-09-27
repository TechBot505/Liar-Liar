import { type Connection, routePartykitRequest, Server } from "partyserver";
import { parseClientMessage } from "../src/game/protocol";
import type { ClientMessage, ServerMessage } from "../src/game/protocol";
import {
  applyClientMessage, createRoom, type Effect, handleDisconnect, tick, viewFor,
} from "../src/game/engine";
import type { GameRecord, RoomState } from "../src/game/types";

const MAX_MESSAGE_BYTES = 4096;
const STORAGE_KEY = "room";
const HOST_GRACE_MS = 20000;
const POST_TIMEOUT_MS = 8000;

interface Env {
  NEXT_PUBLIC_APP_URL?: string;
  PARTY_SECRET?: string;
  main: DurableObjectNamespace;
}

interface ConnState {
  playerId: string;
}

/**
 * partyserver adapter wiring hibernatable connections and DO alarms to the pure
 * engine. The playerId↔connection binding lives in each connection's `state`
 * (attachment) and room state in DO storage; both survive hibernation, so
 * `this.state` is a lazy cache (room code = this.name).
 */
export class LiarLiarServer extends Server<Env> {
  static options = { hibernate: true };
  private state: RoomState | null = null;

  async onStart(): Promise<void> {
    try {
      const saved = await this.ctx.storage.get<RoomState>(STORAGE_KEY);
      if (saved) this.state = saved;
    } catch (err) {
      console.error("onStart failed", err);
    }
  }

  async onMessage(conn: Connection<ConnState>, message: string | ArrayBuffer | ArrayBufferView): Promise<void> {
    if (typeof message !== "string" || message.length > MAX_MESSAGE_BYTES) return;
    const msg = parseClientMessage(message);
    if (!msg) return;
    const now = Date.now();
    try {
      const state = await this.ensureState(now);
      if (msg.type === "join") {
        const result = applyClientMessage(state, msg.playerId, msg, now);
        if (!result.effects.some((e) => e.type === "error")) conn.setState({ playerId: msg.playerId });
        this.state = result.state;
        await this.runEffects(result.state, result.effects, now, conn);
        return;
      }
      const playerId = conn.state?.playerId;
      if (!playerId) return;
      const result = applyClientMessage(state, playerId, msg as ClientMessage, now);
      this.state = result.state;
      await this.runEffects(result.state, result.effects, now, conn);
    } catch (err) {
      console.error("onMessage failed", err);
    }
  }

  async onClose(conn: Connection<ConnState>): Promise<void> {
    const playerId = conn.state?.playerId;
    if (!playerId || this.connForPlayer(playerId, conn.id)) return;
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
        const saved = await this.ctx.storage.get<RoomState>(STORAGE_KEY);
        if (!saved) return;
        state = saved;
        this.state = saved;
      }
      const now = Date.now();
      const result = tick(state, now);
      this.state = result.state;
      await this.runEffects(result.state, result.effects, now);
    } catch (err) {
      console.error("onAlarm failed", err);
    }
  }

  private async ensureState(now: number): Promise<RoomState> {
    if (this.state) return this.state;
    const saved = await this.ctx.storage.get<RoomState>(STORAGE_KEY);
    this.state = saved ?? createRoom(this.name, now);
    return this.state;
  }

  private connForPlayer(playerId: string, exclude?: string): Connection<ConnState> | undefined {
    for (const c of this.getConnections<ConnState>()) {
      if (c.id !== exclude && c.state?.playerId === playerId) return c;
    }
    return undefined;
  }

  private async runEffects(state: RoomState, effects: Effect[], now: number, sender?: Connection<ConnState>): Promise<void> {
    let dirty = false;
    for (const e of effects) {
      switch (e.type) {
        case "broadcast": this.broadcastState(state, now); dirty = true; break;
        case "schedule": await this.scheduleAlarm(e.at); break;
        case "error": this.sendTo(e.to, { type: "error", code: e.code, message: e.message }, sender); break;
        case "pong": this.sendTo(e.to, { type: "pong", now: e.now }, sender); break;
        case "reaction":
          this.broadcast(JSON.stringify({ type: "reaction", playerId: e.playerId, emoji: e.emoji }));
          break;
        case "kicked": this.sendTo(e.to, { type: "kicked" }, sender); dirty = true; break;
        case "gameOver": dirty = true; await this.postRecord(state, e.record); break;
      }
    }
    if (dirty) await this.ctx.storage.put(STORAGE_KEY, state);
  }

  private broadcastState(state: RoomState, now: number): void {
    for (const conn of this.getConnections<ConnState>()) {
      const playerId = conn.state?.playerId;
      if (!playerId) continue;
      conn.send(JSON.stringify({ type: "state", view: viewFor(state, playerId, now) } satisfies ServerMessage));
    }
  }

  private sendTo(playerId: string, msg: ServerMessage, fallback?: Connection<ConnState>): void {
    const conn = this.connForPlayer(playerId) ?? fallback;
    conn?.send(JSON.stringify(msg));
  }

  private async scheduleAlarm(at: number): Promise<void> {
    const existing = await this.ctx.storage.getAlarm();
    if (existing === null || at < existing) await this.ctx.storage.setAlarm(at);
  }

  /** POST the finished game: awaited, 8s timeout, one retry, never throws. */
  private async postRecord(state: RoomState, record: GameRecord): Promise<void> {
    const appUrl = this.env.NEXT_PUBLIC_APP_URL;
    const secret = this.env.PARTY_SECRET;
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
          body, signal: controller.signal,
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

  private async fillTokenHashes(state: RoomState, players: GameRecord["players"]): Promise<GameRecord["players"]> {
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

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    return (await routePartykitRequest(request, env)) ?? new Response("Not Found", { status: 404 });
  },
};

export default worker;
