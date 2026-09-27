import { getDeck } from "@/decks/registry";
import { isTooCloseToTruth } from "../match";
import { selectQuestions } from "../select";
import type { RoomState, Settings } from "../types";
import { type ApplyResult, type Effect, err } from "./constants";
import { connectedActive, enterReveal, enterScores, enterVoting, startRound, advanceAfterScores } from "./rounds";
import { mergeSettings, validateSettings } from "./settings";

const REACTION_MS = 700;

function hostOnly(state: RoomState, playerId: string): Effect | null {
  return state.hostId === playerId ? null : err(playerId, "host_only", "Host only.");
}

export function handleCreate(state: RoomState, playerId: string, settings: Settings): ApplyResult {
  if (state.hostId !== null && state.hostId !== playerId) {
    return { state, effects: [err(playerId, "room_taken", "Room already exists.")] };
  }
  // `create` is the join→create handshake and must not double as a mid-game
  // settings override. Once a game has started, settings are locked (see
  // handleUpdateSettings); accepting `create` here would let the host mutate
  // rounds/timers mid-round and desync the reveal/final calculations.
  if (state.phase !== "lobby") {
    return { state, effects: [err(playerId, "bad_phase", "Game already started.")] };
  }
  const bad = validateSettings(settings);
  if (bad) return { state, effects: [err(playerId, bad.code, bad.message)] };
  if (state.hostId === null) state.hostId = playerId;
  state.settings = settings;
  return { state, effects: [{ type: "broadcast" }] };
}

export function handleUpdateSettings(
  state: RoomState, playerId: string, patch: Partial<Settings>,
): ApplyResult {
  const notHost = hostOnly(state, playerId);
  if (notHost) return { state, effects: [notHost] };
  if (state.phase !== "lobby") {
    return { state, effects: [err(playerId, "bad_phase", "Settings are locked.")] };
  }
  const merged = mergeSettings(state.settings, patch);
  const bad = validateSettings(merged);
  if (bad) return { state, effects: [err(playerId, bad.code, bad.message)] };
  state.settings = merged;
  return { state, effects: [{ type: "broadcast" }] };
}

export function handleStart(state: RoomState, playerId: string, now: number): ApplyResult {
  const notHost = hostOnly(state, playerId);
  if (notHost) return { state, effects: [notHost] };
  if (state.phase !== "lobby") {
    return { state, effects: [err(playerId, "bad_phase", "Game already started.")] };
  }
  if (state.players.length < 2) {
    return { state, effects: [err(playerId, "need_players", "Need at least 2 players.")] };
  }
  const deck = getDeck(state.settings.deckId);
  const bad = validateSettings(state.settings);
  if (!deck || bad) {
    return { state, effects: [err(playerId, "bad_settings", bad?.message ?? "Unknown deck.")] };
  }
  state.gameNumber += 1;
  for (const p of state.players) p.score = 0;
  state.history = [];
  state.final = null;
  const seenLists = state.players.map((p) => p.seen);
  state.questions = selectQuestions(
    deck, state.settings.rounds, seenLists, `${state.code}:${state.gameNumber}`, state.settings.familyMode,
  );
  return startRound(state, 0, now);
}

function allSubmitted(state: RoomState): boolean {
  const req = connectedActive(state);
  if (req.length === 0 || !state.round) return false;
  return req.every((p) => state.round?.submissions[p.id]);
}

export function handleSubmitLie(
  state: RoomState, playerId: string, text: string, now: number,
): ApplyResult {
  if (state.phase !== "answering" || !state.round) {
    return { state, effects: [err(playerId, "bad_phase", "Not accepting lies now.")] };
  }
  const p = state.players.find((x) => x.id === playerId);
  if (!p || !p.active) return { state, effects: [err(playerId, "not_active", "You join next round.")] };
  const trimmed = text.trim();
  if (trimmed.length < 1 || trimmed.length > 60) {
    return { state, effects: [err(playerId, "bad_lie", "Lie must be 1–60 characters.")] };
  }
  const round = state.round;
  const isTarget = round.kind === "player" && playerId === round.targetId;
  if (isTarget) {
    round.truthText = trimmed;
  } else if (round.kind === "fact" && isTooCloseToTruth(trimmed, round.truthText, round.question.alts)) {
    return { state, effects: [err(playerId, "too_close", "Too close to the truth! Try another lie.")] };
  }
  round.submissions[playerId] = { text: trimmed, submittedAt: now };
  if (allSubmitted(state)) return enterVoting(state, now);
  return { state, effects: [{ type: "broadcast" }] };
}

function allVoted(state: RoomState): boolean {
  if (!state.round) return false;
  const eligible = connectedActive(state).filter(
    (p) => !(state.round?.kind === "player" && p.id === state.round?.targetId),
  );
  if (eligible.length === 0) return false;
  return eligible.every((p) => state.round?.votes[p.id]);
}

export function handleVote(
  state: RoomState, playerId: string, optionId: string, now: number,
): ApplyResult {
  if (state.phase !== "voting" || !state.round) {
    return { state, effects: [err(playerId, "bad_phase", "Not voting now.")] };
  }
  const round = state.round;
  const p = state.players.find((x) => x.id === playerId);
  if (!p || !p.active) return { state, effects: [err(playerId, "not_active", "You join next round.")] };
  if (round.kind === "player" && playerId === round.targetId) {
    return { state, effects: [err(playerId, "target_no_vote", "The target doesn't vote.")] };
  }
  const opt = round.options.find((o) => o.id === optionId);
  if (!opt) return { state, effects: [err(playerId, "bad_option", "Unknown option.")] };
  if (opt.authorIds.includes(playerId)) {
    return { state, effects: [err(playerId, "own_lie", "You can't vote for your own lie.")] };
  }
  round.votes[playerId] = optionId;
  if (allVoted(state)) return enterReveal(state, now);
  return { state, effects: [{ type: "broadcast" }] };
}

export function handleNext(state: RoomState, playerId: string, now: number): ApplyResult {
  const notHost = hostOnly(state, playerId);
  if (notHost) return { state, effects: [notHost] };
  if (state.phase === "reveal") return enterScores(state, now);
  if (state.phase === "scores") return advanceAfterScores(state, now);
  return { state, effects: [err(playerId, "bad_phase", "Nothing to advance.")] };
}

export function handleReact(
  state: RoomState, playerId: string, emoji: string, now: number,
): ApplyResult {
  const p = state.players.find((x) => x.id === playerId);
  if (!p) return { state, effects: [] };
  if (now - p.lastReactionAt < REACTION_MS) return { state, effects: [] };
  p.lastReactionAt = now;
  return { state, effects: [{ type: "reaction", playerId, emoji }] };
}

export function handlePlayAgain(state: RoomState, playerId: string): ApplyResult {
  const notHost = hostOnly(state, playerId);
  if (notHost) return { state, effects: [notHost] };
  if (state.phase !== "final") {
    return { state, effects: [err(playerId, "bad_phase", "Game isn't over.")] };
  }
  for (const p of state.players) { p.score = 0; p.active = true; }
  state.history = [];
  state.round = null;
  state.final = null;
  state.questions = [];
  state.phase = "lobby";
  return { state, effects: [{ type: "broadcast" }] };
}
