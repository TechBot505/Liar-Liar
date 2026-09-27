import type { FinalState, RoomView } from "@/game/types";
import type { GameSummary } from "@/lib/store";
import { normalizeAvatar } from "@/lib/avatar";

/** Stable-ish id for a finished game: code + a hash of the final scores so the
 *  same game de-dupes but a rematch (different scores) records a new entry. */
function gameId(code: string, final: FinalState): string {
  let h = 2166136261;
  const key = final.standings.map((s) => `${s.playerId}:${s.score}`).join("|");
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `${code}-${(h >>> 0).toString(36)}`;
}

/** Convert a final RoomView into a local GameSummary for the history store. */
export function toGameSummary(view: RoomView, final: FinalState): GameSummary {
  const you = final.standings.find((s) => s.playerId === view.you);
  return {
    id: gameId(view.code, final),
    code: view.code,
    deckId: view.settings.deckId,
    playedAt: Date.now(),
    players: final.standings.map((s) => ({
      id: s.playerId,
      name: s.name,
      avatar: normalizeAvatar(s.avatar),
      score: s.score,
      rank: s.rank,
      isYou: s.playerId === view.you,
    })),
    yourRank: you?.rank ?? 0,
    youId: view.you,
    awards: final.awards,
  };
}
