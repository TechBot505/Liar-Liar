import type { DeckKind, Question } from "@/decks/types";

/** Opaque avatar config blob owned by the client; the engine only passes it through. */
export type AvatarConfig = Record<string, unknown>;

export type Phase = "lobby" | "answering" | "voting" | "reveal" | "scores" | "final";

export const ROUND_OPTIONS = [5, 7, 10] as const;
export const ANSWER_OPTIONS = [30, 45, 60, 90] as const;
export const VOTE_OPTIONS = [20, 30, 45] as const;

export interface Settings {
  deckId: string;
  rounds: 5 | 7 | 10;
  answerSeconds: 30 | 45 | 60 | 90;
  voteSeconds: 20 | 30 | 45;
  doubleFinal: boolean;
  familyMode: boolean;
}

/** Full server-side player record. `token` is secret and never leaves the server. */
export interface Player {
  id: string;
  token: string;
  name: string;
  avatar: AvatarConfig;
  score: number;
  connected: boolean;
  /** Participates in the current round. Late joiners are inactive until next round. */
  active: boolean;
  /** epoch ms the seat was first created (host-transfer tie-break: longest connected). */
  joinedAt: number;
  /** epoch ms of last disconnect, or null when connected (drives >20s host transfer). */
  disconnectedAt: number | null;
  /** epoch ms of last accepted reaction (rate limiting). */
  lastReactionAt: number;
  /** Question ids this player has already seen (merged into selection at game start). */
  seen: string[];
}

/** A submitted lie before options are built. */
export interface Submission {
  text: string;
  submittedAt: number;
}

/** A voting option: unique lie or the truth, credited to zero+ authors. */
export interface RoundOption {
  id: string;
  /** Canonical (unmasked) display text; masking is applied in viewFor. */
  text: string;
  authorIds: string[];
  isTruth: boolean;
}

/** Live per-round server state (holds secrets: raw lies + truth). */
export interface RoundState {
  index: number;
  question: Question;
  deckId: string;
  kind: DeckKind;
  targetId?: string;
  prompt: string;
  truthText: string;
  answeringStartedAt: number;
  submissions: Record<string, Submission>;
  options: RoundOption[];
  votes: Record<string, string>;
  result: RoundResult | null;
  deadline: number;
}

export interface RoomState {
  code: string;
  phase: Phase;
  hostId: string | null;
  settings: Settings;
  players: Player[];
  gameNumber: number;
  questions: Question[];
  round: RoundState | null;
  history: RoundResult[];
  bannedTokens: string[];
  final: FinalState | null;
  createdAt: number;
  lastActivityAt: number;
}

/** Outcome of a single option after reveal. */
export interface OptionResult {
  id: string;
  text: string;
  authorIds: string[];
  isTruth: boolean;
  voterIds: string[];
}

export interface RoundResult {
  index: number;
  questionId: string;
  prompt: string;
  deckId: string;
  kind: DeckKind;
  targetId?: string;
  truthText: string;
  options: OptionResult[];
  /** Score delta per player earned this round. */
  scores: Record<string, number>;
  /** Submit latency ms (from answering start) per player who submitted. */
  latencies: Record<string, number>;
}

export interface Standing {
  playerId: string;
  name: string;
  avatar: AvatarConfig;
  score: number;
  rank: number;
}

export interface Award {
  id: string;
  label: string;
  playerId: string;
  /** For pair awards (Nemesis). */
  secondaryPlayerId?: string;
  value: number;
  detail?: string;
}

export interface FinalState {
  standings: Standing[];
  awards: Award[];
}

export interface PlayerStats {
  fooled: number;
  truthsFound: number;
  gullible: number;
  bestSingleLie: number;
  avgSubmitMs: number;
}

export interface GamePlayerRecord {
  seatId: string;
  name: string;
  avatar: AvatarConfig;
  score: number;
  rank: number;
  stats: PlayerStats;
  /** sha256 of the player token; filled by the server, "" from the pure engine. */
  tokenHash: string;
}

export interface GameRecord {
  code: string;
  deckId: string;
  rounds: number;
  startedAt: number;
  endedAt: number;
  players: GamePlayerRecord[];
  awards: Award[];
}

/** Per-player public projection sent as the `state` message. */
export interface RoomView {
  code: string;
  phase: Phase;
  hostId: string | null;
  you: string;
  players: PlayerView[];
  settings: Settings;
  round?: RoundView;
  final?: FinalState;
  now: number;
}

export interface PlayerView {
  id: string;
  name: string;
  avatar: AvatarConfig;
  score: number;
  connected: boolean;
  isHost: boolean;
  submitted: boolean;
  voted: boolean;
}

export interface RoundView {
  index: number;
  total: number;
  prompt: string;
  deckId: string;
  kind: DeckKind;
  targetId?: string;
  deadline: number;
  options?: { id: string; text: string }[];
  yourLieOptionId?: string;
  result?: RoundResult;
}
