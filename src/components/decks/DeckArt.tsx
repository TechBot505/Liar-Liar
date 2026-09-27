"use client";

import { useId, type JSX, type FC } from "react";
import { cn } from "@/lib/cn";
import { deckTheme } from "@/decks/theme";
import { useInView } from "./useInView";
import type { ArtProps, DeckArtSize } from "./artProps";
import { FactsArt } from "./art/FactsArt";
import { TruthArt } from "./art/TruthArt";
import { WordsArt } from "./art/WordsArt";
import { DesiArt } from "./art/DesiArt";
import { MoviesArt } from "./art/MoviesArt";
import { HistoryArt } from "./art/HistoryArt";
import { ThingsArt } from "./art/ThingsArt";
import { AcronymsArt } from "./art/AcronymsArt";
import { AfterdarkArt } from "./art/AfterdarkArt";

const ART: Record<string, FC<ArtProps>> = {
  facts: FactsArt,
  truth: TruthArt,
  words: WordsArt,
  desi: DesiArt,
  movies: MoviesArt,
  history: HistoryArt,
  things: ThingsArt,
  acronyms: AcronymsArt,
  afterdark: AfterdarkArt,
};

const SIZE_CLASS: Record<DeckArtSize, string> = {
  sm: "h-14",
  md: "h-28",
  lg: "h-40",
};

export interface DeckArtProps {
  deckId: string;
  size?: DeckArtSize;
  animated?: boolean;
  className?: string;
}

/**
 * Renders a deck's generative artwork as pure SVG/CSS (no external images).
 * Decorative by design → `aria-hidden`. Animations run only when on-screen and
 * `animated` (default true); reduced-motion users get a static frame globally.
 */
export function DeckArt({ deckId, size = "md", animated = true, className }: DeckArtProps): JSX.Element {
  const uid = useId().replace(/:/g, "");
  const { ref, inView } = useInView<HTMLDivElement>();
  const theme = deckTheme(deckId);
  const Art = ART[deckId] ?? FactsArt;
  const play = animated && inView;
  return (
    <div
      ref={ref}
      aria-hidden
      data-play={play ? "true" : "false"}
      className={cn("deck-art relative overflow-hidden rounded-(--radius-card)", SIZE_CLASS[size], className)}
      style={{
        background: `radial-gradient(120% 100% at 20% 0%, ${theme.tint2}55, transparent 60%), radial-gradient(120% 120% at 100% 100%, ${theme.tint}22, transparent 55%), var(--color-surface-2)`,
      }}
    >
      <Art tint={theme.tint} tint2={theme.tint2} animated={animated} uid={uid} size={size} />
      <span className="grain pointer-events-none absolute inset-0" />
    </div>
  );
}
