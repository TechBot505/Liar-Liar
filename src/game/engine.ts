import type { ClientMessage } from "./protocol";
import type { RoomState } from "./types";
import { type ApplyResult, type Effect, HOST_TRANSFER_MS } from "./engine/constants";
import {
  handleCreate, handleNext, handlePlayAgain, handleReact, handleStart,
  handleSubmitLie, handleUpdateSettings, handleVote,
} from "./engine/handlers";
import {
  handleJoin, handleKick, handleLeave, longestConnected,
} from "./engine/membership";
import { advanceAfterScores, enterReveal, enterScores, enterVoting } from "./engine/rounds";

export { createRoom } from "./engine/constants";
export type { ApplyResult, Effect } from "./engine/constants";
export { viewFor } from "./engine/view";
export { handleDisconnect } from "./engine/membership";

/**
 * Pure reducer entrypoint. `playerId` is resolved by the runtime from the
 * connection (for `join` the message carries its own identity). Returns the
 * next state plus the effects the runtime must perform (broadcast, schedule,
 * send error/reaction/kicked/pong, or persist a finished game).
 */
export function applyClientMessage(
  state: RoomState, playerId: string, msg: ClientMessage, now: number,
): ApplyResult {
  state.lastActivityAt = now;
  switch (msg.type) {
    case "join":
      return handleJoin(state, msg, now);
    case "create":
      return handleCreate(state, playerId, msg.settings);
    case "updateSettings":
      return handleUpdateSettings(state, playerId, msg.settings);
    case "start":
      return handleStart(state, playerId, now);
    case "submitLie":
      return handleSubmitLie(state, playerId, msg.text, now);
    case "vote":
      return handleVote(state, playerId, msg.optionId, now);
    case "next":
      return handleNext(state, playerId, now);
    case "react":
      return handleReact(state, playerId, msg.emoji, now);
    case "kick":
      return handleKick(state, playerId, msg.playerId);
    case "playAgain":
      return handlePlayAgain(state, playerId);
    case "leave":
      return handleLeave(state, playerId);
    case "ping":
      return { state, effects: [{ type: "pong", to: playerId, now }] };
  }
}

/** Transfer host if the current host has been disconnected past the grace period. */
function maybeTransferHost(state: RoomState, now: number): boolean {
  const host = state.hostId ? state.players.find((p) => p.id === state.hostId) : undefined;
  const stale = !host || (!host.connected && host.disconnectedAt !== null
    && now - host.disconnectedAt > HOST_TRANSFER_MS);
  if (!stale) return false;
  const next = longestConnected(state, state.hostId ?? undefined);
  if (next && next !== state.hostId) { state.hostId = next; return true; }
  return false;
}

/**
 * Advance any phase whose deadline has passed and handle delayed host transfer.
 * Called by the runtime on alarm/interval. Advances at most one phase per call;
 * the returned `schedule` effect drives the next tick.
 */
export function tick(state: RoomState, now: number): ApplyResult {
  const hostChanged = maybeTransferHost(state, now);
  const round = state.round;
  if (round && now >= round.deadline) {
    switch (state.phase) {
      case "answering":
        return enterVoting(state, now);
      case "voting":
        return enterReveal(state, now);
      case "reveal":
        return enterScores(state, now);
      case "scores":
        return advanceAfterScores(state, now);
    }
  }
  // No phase advanced. Re-arm the alarm for the current round's deadline so a
  // wake that fired *before* that deadline can never leave a live phase without
  // a pending alarm. This happens when an earlier alarm — a suppressed
  // early-advance reschedule (the runtime only moves an alarm earlier) or a
  // host-disconnect grace alarm — fires first: without re-arming, voting/reveal/
  // scores would hang forever whenever players don't all act in time.
  const effects: Effect[] = [];
  if (hostChanged) effects.push({ type: "broadcast" });
  if (round && now < round.deadline) effects.push({ type: "schedule", at: round.deadline });
  return { state, effects };
}
