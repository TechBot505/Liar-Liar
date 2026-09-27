import { maybeMask } from "../profanity";
import type {
  OptionResult, PlayerView, RoomState, RoomView, RoundResult, RoundView,
} from "../types";

const OPTION_PHASES = new Set(["voting", "reveal", "scores"]);
const RESULT_PHASES = new Set(["reveal", "scores"]);

function maskResult(result: RoundResult, family: boolean): RoundResult {
  return {
    ...result,
    truthText: maybeMask(result.truthText, family),
    options: result.options.map((o: OptionResult) => ({
      ...o, text: maybeMask(o.text, family),
    })),
  };
}

/**
 * Build the public view for one player. NEVER leaks: other players' lies while
 * answering, which option is the truth before reveal, or any token. During
 * voting, options carry only {id,text}; truth identity arrives with `result`
 * at reveal.
 */
export function viewFor(state: RoomState, playerId: string, now: number): RoomView {
  const family = state.settings.familyMode;
  const round = state.round;
  const submittedIds = round ? new Set(Object.keys(round.submissions)) : new Set<string>();
  const votedIds = round ? new Set(Object.keys(round.votes)) : new Set<string>();

  const players: PlayerView[] = state.players.map((p) => ({
    id: p.id,
    name: maybeMask(p.name, family),
    avatar: p.avatar,
    score: p.score,
    connected: p.connected,
    isHost: state.hostId === p.id,
    submitted: submittedIds.has(p.id),
    voted: votedIds.has(p.id),
  }));

  let roundView: RoundView | undefined;
  if (round) {
    const showOptions = OPTION_PHASES.has(state.phase);
    const showResult = RESULT_PHASES.has(state.phase) && round.result;
    const yourLie = round.options.find((o) => o.authorIds.includes(playerId));
    roundView = {
      index: round.index,
      total: state.settings.rounds,
      prompt: round.prompt,
      deckId: round.deckId,
      kind: round.kind,
      targetId: round.targetId,
      deadline: round.deadline,
      options: showOptions
        ? round.options.map((o) => ({ id: o.id, text: maybeMask(o.text, family) }))
        : undefined,
      yourLieOptionId: showOptions && yourLie ? yourLie.id : undefined,
      result: showResult && round.result ? maskResult(round.result, family) : undefined,
    };
  }

  return {
    code: state.code,
    phase: state.phase,
    hostId: state.hostId,
    you: playerId,
    players,
    settings: state.settings,
    round: roundView,
    final: state.final ?? undefined,
    now,
  };
}
