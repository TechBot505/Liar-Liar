import type { DeckTheme } from "@/decks/theme";

export type DeckArtSize = "sm" | "md" | "lg";

/** Props passed to every per-deck art component by <DeckArt>. */
export interface ArtProps extends DeckTheme {
  /** Whether animations should run (also gated by in-view + reduced-motion). */
  animated: boolean;
  /** Collision-free id prefix for SVG gradient/filter defs. */
  uid: string;
  size: DeckArtSize;
}

/** Faint coral highlight shared across decks (the app's single accent). */
export const CORAL = "#FF5A4E";
