/**
 * Per-deck visual identity. Each deck gets a two-tone, desaturated palette that
 * reads elegantly on the near-black canvas — a muted accent tint plus a deeper
 * companion tone. NEVER neon: these are dusty, editorial hues that sit quietly
 * beside the single coral app accent (#FF5A4E), which art layers add as a faint
 * highlight. Keep in sync with the deck registry ids.
 */
export interface DeckTheme {
  /** Primary muted accent tint (used for lines / key shapes). */
  tint: string;
  /** Deeper companion tone (used for fills / gradient mesh base). */
  tint2: string;
}

/** Fallback for unknown / test decks — neutral coral-leaning slate. */
const FALLBACK: DeckTheme = { tint: "#9A9AA6", tint2: "#3A3A44" };

export const DECK_THEME: Record<string, DeckTheme> = {
  // amber-ish muted — curious, warm
  facts: { tint: "#D9A441", tint2: "#5A4620" },
  // rose — intimate, revealing
  truth: { tint: "#DB8598", tint2: "#5A2E3A" },
  // indigo — bookish, cerebral
  words: { tint: "#8C93D6", tint2: "#2E325E" },
  // saffron — festive, radiant (respectful, abstract)
  desi: { tint: "#E0A24E", tint2: "#5E3A18" },
  // crimson — dramatic, cinematic
  movies: { tint: "#CE6E6E", tint2: "#521F26" },
  // bronze — aged, storied
  history: { tint: "#C08A5E", tint2: "#4E3620" },
  // teal — everyday, tactile
  things: { tint: "#5FB2A6", tint2: "#1E463F" },
  // sage — dry, alphabetic
  acronyms: { tint: "#9CB585", tint2: "#37472C" },
  // deep violet — nocturnal, hushed
  afterdark: { tint: "#8E7BC4", tint2: "#241C3E" },
};

export function deckTheme(id: string): DeckTheme {
  return DECK_THEME[id] ?? FALLBACK;
}
