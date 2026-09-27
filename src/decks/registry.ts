import type { Deck } from "./types";
import { deck as facts } from "./facts";
import { deck as history } from "./history";
import { deck as words } from "./words";
import { deck as things } from "./things";
import { deck as acronyms } from "./acronyms";
import { deck as desi } from "./desi";
import { deck as movies } from "./movies";
import { deck as truth } from "./truth";
import { deck as afterdark } from "./afterdark";

/**
 * Central deck registry. Adding a deck = create `src/decks/<id>/index.ts` exporting `deck`
 * and add one import + one array entry below. Order here is the order shown in the picker.
 * `getDeck`/`listDecks` are the only lookup surface the engine, server and UI use.
 */
export const DECKS: Deck[] = [facts, truth, words, desi, movies, history, things, acronyms, afterdark];

export const DEFAULT_DECK_ID = "facts";

const byId = new Map<string, Deck>(DECKS.map((d) => [d.id, d]));

export function getDeck(id: string): Deck | undefined {
  return byId.get(id);
}

export function listDecks(): Deck[] {
  return DECKS;
}

/**
 * Register an extra (non-listed) deck, e.g. fixtures in unit tests. Registered decks are
 * resolvable via `getDeck` but never appear in `listDecks()`.
 */
export function registerDeck(deck: Deck): void {
  byId.set(deck.id, deck);
}
