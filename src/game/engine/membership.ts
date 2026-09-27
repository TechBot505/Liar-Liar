import type { JoinMessage } from "../protocol";
import type { Player, RoomState } from "../types";
import { type ApplyResult, err } from "./constants";

const MAX_PLAYERS = 12;
const SEEN_CAP = 2000;

function mergeSeen(existing: string[], incoming: string[]): string[] {
  const set = new Set(existing);
  for (const id of incoming) set.add(id);
  return [...set].slice(-SEEN_CAP);
}

/** Longest-connected player (smallest joinedAt), optionally excluding one id. */
export function longestConnected(state: RoomState, excludeId?: string): string | null {
  const pool = state.players
    .filter((p) => p.connected && p.id !== excludeId)
    .sort((a, b) => a.joinedAt - b.joinedAt);
  return pool[0]?.id ?? null;
}

export function handleJoin(state: RoomState, msg: JoinMessage, now: number): ApplyResult {
  if (state.bannedTokens.includes(msg.token)) {
    return { state, effects: [err(msg.playerId, "kicked", "You were removed from this room.")] };
  }
  const existing = state.players.find((p) => p.id === msg.playerId);
  if (existing) {
    if (existing.token !== msg.token) {
      return { state, effects: [err(msg.playerId, "seat_taken", "That seat is taken.")] };
    }
    existing.connected = true;
    existing.disconnectedAt = null;
    existing.name = msg.name;
    existing.avatar = msg.avatar;
    existing.seen = mergeSeen(existing.seen, msg.seen);
    if (state.hostId === null) state.hostId = existing.id;
    return { state, effects: [{ type: "broadcast" }] };
  }
  if (state.players.length >= MAX_PLAYERS) {
    return { state, effects: [err(msg.playerId, "room_full", "This room is full.")] };
  }
  const player: Player = {
    id: msg.playerId,
    token: msg.token,
    name: msg.name,
    avatar: msg.avatar,
    score: 0,
    connected: true,
    // Late joiners mid-game are inactive until the next round starts.
    active: state.phase === "lobby",
    joinedAt: now,
    disconnectedAt: null,
    lastReactionAt: 0,
    seen: msg.seen.slice(-SEEN_CAP),
  };
  state.players.push(player);
  if (state.hostId === null) state.hostId = player.id;
  return { state, effects: [{ type: "broadcast" }] };
}

/** Mark a player disconnected (server calls on socket close). Host transfer waits for tick. */
export function handleDisconnect(state: RoomState, playerId: string, now: number): ApplyResult {
  const p = state.players.find((x) => x.id === playerId);
  if (!p) return { state, effects: [] };
  p.connected = false;
  p.disconnectedAt = now;
  return { state, effects: [{ type: "broadcast" }] };
}

/** Explicit leave: seat removed immediately; host transfers now if needed. */
export function handleLeave(state: RoomState, playerId: string): ApplyResult {
  const idx = state.players.findIndex((p) => p.id === playerId);
  if (idx === -1) return { state, effects: [] };
  const wasHost = state.hostId === playerId;
  state.players.splice(idx, 1);
  if (wasHost) state.hostId = longestConnected(state);
  return { state, effects: [{ type: "broadcast" }] };
}

export function handleKick(
  state: RoomState, hostId: string, targetId: string,
): ApplyResult {
  if (state.hostId !== hostId) {
    return { state, effects: [err(hostId, "host_only", "Only the host can kick.")] };
  }
  if (targetId === hostId) {
    return { state, effects: [err(hostId, "bad_target", "You can't kick yourself.")] };
  }
  const target = state.players.find((p) => p.id === targetId);
  if (!target) return { state, effects: [{ type: "broadcast" }] };
  state.bannedTokens.push(target.token);
  state.players = state.players.filter((p) => p.id !== targetId);
  return { state, effects: [{ type: "kicked", to: targetId }, { type: "broadcast" }] };
}
