import type { Deck } from "@/decks/types";
import { getDeck } from "@/decks/registry";
import { seededShuffle } from "../rng";
import { scoreRound } from "../scoring";
import type {
  OptionResult, Player, RoomState, RoundOption, RoundResult, RoundState,
} from "../types";
import { type ApplyResult, revealMs, SCORES_MS } from "./constants";
import { normalizeLie } from "../match";
import { enterFinal } from "./finalize";

export function activePlayers(state: RoomState): Player[] {
  return state.players.filter((p) => p.active);
}

/** Players who must act this phase: active + connected (missing players don't block). */
export function connectedActive(state: RoomState): Player[] {
  return state.players.filter((p) => p.active && p.connected);
}

function seed(state: RoomState, suffix: string): string {
  return `${state.code}:${state.gameNumber}:${state.round?.index ?? 0}:${suffix}`;
}

function deckFor(state: RoomState): Deck | undefined {
  return getDeck(state.settings.deckId);
}

/** Rotating target for player decks: index-th active player ordered by seat age. */
function pickTarget(state: RoomState, index: number): string | undefined {
  const pool = activePlayers(state).slice().sort((a, b) => a.joinedAt - b.joinedAt);
  if (pool.length === 0) return undefined;
  return pool[index % pool.length].id;
}

export function startRound(state: RoomState, index: number, now: number): ApplyResult {
  const deck = deckFor(state);
  const question = state.questions[index];
  // Late joiners become active from the next round: activate everyone present now.
  for (const p of state.players) p.active = true;
  const kind = deck?.kind ?? "fact";
  const targetId = kind === "player" ? pickTarget(state, index) : undefined;
  const targetName = targetId ? state.players.find((p) => p.id === targetId)?.name ?? "" : "";
  const prompt = question
    ? question.prompt.replace(/\{target\}/g, targetName)
    : "";
  const round: RoundState = {
    index,
    question: question ?? { id: "", prompt: "", answer: "" },
    deckId: state.settings.deckId,
    kind,
    targetId,
    prompt,
    truthText: kind === "player" ? "" : question?.answer ?? "",
    answeringStartedAt: now,
    submissions: {},
    options: [],
    votes: {},
    result: null,
    deadline: now + state.settings.answerSeconds * 1000,
  };
  state.round = round;
  state.phase = "answering";
  return { state, effects: [{ type: "broadcast" }, { type: "schedule", at: round.deadline }] };
}

function buildOptions(state: RoomState, round: RoundState): RoundOption[] {
  const groups = new Map<string, { text: string; authors: string[] }>();
  for (const p of state.players) {
    if (!p.active) continue;
    if (round.kind === "player" && p.id === round.targetId) continue;
    const sub = round.submissions[p.id];
    if (!sub) continue;
    const key = normalizeLie(sub.text);
    if (key.length === 0) continue;
    const g = groups.get(key);
    if (g) g.authors.push(p.id);
    else groups.set(key, { text: sub.text.trim(), authors: [p.id] });
  }
  const lies: RoundOption[] = [...groups.values()].map((g) => ({
    id: "", text: displayText(g.text), authorIds: g.authors, isTruth: false,
  }));
  const truth: RoundOption = { id: "", text: displayText(round.truthText), authorIds: [], isTruth: true };
  // Ids are assigned AFTER shuffling so they only encode display order — they must never
  // reveal which option is the truth or which player wrote a lie.
  return seededShuffle([...lies, truth], seed(state, "opts")).map((o, i) => ({ ...o, id: `o${i + 1}` }));
}

/**
 * Normalize every option identically so formatting can't give the truth away
 * (e.g. truth "sand" vs a lie typed as "Glitter."): trim, collapse whitespace, drop trailing
 * sentence punctuation, and capitalize a leading lowercase letter for EVERY option
 * ("sand" -> "Sand"). Mixed-case brands like "iPhone" are left as typed.
 */
export function displayText(raw: string): string {
  const t = raw.replace(/\s+/g, " ").trim().replace(/[.!]+$/, "").trim();
  if (/^[a-z](?![A-Z])/.test(t)) return t.charAt(0).toUpperCase() + t.slice(1);
  return t;
}

export function enterVoting(state: RoomState, now: number): ApplyResult {
  const round = state.round;
  if (!round) return { state, effects: [] };
  round.options = buildOptions(state, round);
  round.votes = {};
  state.phase = "voting";
  round.deadline = now + state.settings.voteSeconds * 1000;
  return { state, effects: [{ type: "broadcast" }, { type: "schedule", at: round.deadline }] };
}

export function enterReveal(state: RoomState, now: number): ApplyResult {
  const round = state.round;
  if (!round) return { state, effects: [] };
  const voters: Record<string, string[]> = {};
  for (const opt of round.options) voters[opt.id] = [];
  for (const [pid, oid] of Object.entries(round.votes)) {
    if (voters[oid]) voters[oid].push(pid);
  }
  const isFinal = round.index === state.settings.rounds - 1;
  const deltas = scoreRound({
    kind: round.kind,
    targetId: round.targetId,
    options: round.options.map((o) => ({
      authorIds: o.authorIds, isTruth: o.isTruth, voterIds: voters[o.id],
    })),
    doubleFinal: isFinal && state.settings.doubleFinal,
  });
  for (const p of state.players) if (deltas[p.id]) p.score += deltas[p.id];
  const latencies: Record<string, number> = {};
  for (const [pid, sub] of Object.entries(round.submissions)) {
    latencies[pid] = Math.max(0, sub.submittedAt - round.answeringStartedAt);
  }
  const options: OptionResult[] = round.options.map((o) => ({
    id: o.id, text: o.text, authorIds: o.authorIds, isTruth: o.isTruth, voterIds: voters[o.id],
  }));
  const result: RoundResult = {
    index: round.index, questionId: round.question.id, prompt: round.prompt,
    deckId: round.deckId, kind: round.kind, targetId: round.targetId,
    truthText: round.truthText, options, scores: deltas, latencies,
  };
  round.result = result;
  state.history.push(result);
  state.phase = "reveal";
  round.deadline = now + revealMs(round.options.length);
  return { state, effects: [{ type: "broadcast" }, { type: "schedule", at: round.deadline }] };
}

export function enterScores(state: RoomState, now: number): ApplyResult {
  if (!state.round) return { state, effects: [] };
  state.phase = "scores";
  state.round.deadline = now + SCORES_MS;
  return { state, effects: [{ type: "broadcast" }, { type: "schedule", at: state.round.deadline }] };
}

export function advanceAfterScores(state: RoomState, now: number): ApplyResult {
  const round = state.round;
  if (!round) return { state, effects: [] };
  if (round.index + 1 >= state.settings.rounds) return enterFinal(state, now);
  return startRound(state, round.index + 1, now);
}
