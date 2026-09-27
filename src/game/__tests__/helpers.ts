import { registerDeck } from "@/decks/registry";
import { testFactDeck, testPlayerDeck } from "@/decks/_test";
import { applyClientMessage } from "@/game/engine";
import type { ApplyResult } from "@/game/engine";
import type { ClientMessage } from "@/game/protocol";
import type { RoomState, Settings } from "@/game/types";

// Fixture decks are resolvable by id but never listed in the picker.
registerDeck(testFactDeck);
registerDeck(testPlayerDeck);

export function join(
  state: RoomState, id: string, name: string, now: number, seen: string[] = [],
): ApplyResult {
  const msg: ClientMessage = {
    type: "join", playerId: id, token: `tok-${id}`, name, avatar: {}, seen,
  };
  return applyClientMessage(state, id, msg, now);
}

export function send(
  state: RoomState, id: string, msg: ClientMessage, now: number,
): ApplyResult {
  return applyClientMessage(state, id, msg, now);
}

export const factSettings: Settings = {
  deckId: "_test",
  rounds: 5,
  answerSeconds: 60,
  voteSeconds: 30,
  doubleFinal: true,
  familyMode: true,
};

export const playerSettings: Settings = { ...factSettings, deckId: "_testp", rounds: 5 };
