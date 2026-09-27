/**
 * Deck content contract shared by the deck registry, the party server (question selection)
 * and the UI (deck picker). Keep this file dependency-free — it is imported by party/server.ts.
 */

/** `fact`: objective truth exists. `player`: "Truth Comes Out" style — the target player's answer is the truth. */
export type DeckKind = "fact" | "player";

export interface Question {
  /** Globally unique, stable id: `<deckId>:<n>` e.g. "facts:042". Never renumber once shipped. */
  id: string;
  /**
   * Prompt text. Use `____` for the blank the players fill in.
   * Player decks use `{target}` which is replaced with the target player's name.
   */
  prompt: string;
  /** The real answer (fact decks). Short: ideally 1–5 words, ≤ 40 chars. Empty string for player decks. */
  answer: string;
  /** Other accepted spellings/forms of the truth, used by fuzzy "too close to the truth" matching. */
  alts?: string[];
  /** Optional one-line "fun fact" shown after the reveal. */
  note?: string;
  /** Mildly spicy content — excluded when family-friendly mode is on (unless the whole deck is adult). */
  adult?: boolean;
}

export interface Deck {
  id: string;            // url-safe slug, e.g. "facts"
  name: string;          // display name, e.g. "Is That a Fact?"
  tagline: string;       // one cheeky line for the picker
  description: string;   // 1–2 sentences, explains what to write
  kind: DeckKind;
  /** Instruction shown above the input during answering, e.g. "Write a fake fact that sounds true". */
  lieHint: string;
  /** Emoji used as the deck's sticker icon. */
  emoji: string;
  /** Two CSS colors (hex) for the deck's card gradient / theming. */
  colors: [string, string];
  /** Whole deck is adults-only (hidden when family mode is on). */
  adult?: boolean;
  questions: Question[];
}
