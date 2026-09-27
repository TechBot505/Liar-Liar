import type { JSX } from "react";
import type { Deck } from "@/decks/types";
import { Sticker } from "@/components/ui";
import { cn } from "@/lib/cn";
import { DeckArt } from "./DeckArt";

export interface DeckTileProps {
  deck: Deck;
  animated?: boolean;
  className?: string;
}

/** Compact deck card for horizontal lists: animated art header + name + tagline + count. */
export function DeckTile({ deck, animated, className }: DeckTileProps): JSX.Element {
  return (
    <article
      className={cn(
        "no-tap-highlight flex flex-col overflow-hidden rounded-(--radius-card) border border-line bg-surface shadow-soft",
        className,
      )}
    >
      <div className="relative">
        <DeckArt deckId={deck.id} size="md" animated={animated} className="rounded-none" />
        {deck.adult && (
          <Sticker tone="accent" className="absolute right-2 top-2 px-2 py-0.5 text-[0.6rem]">
            18+
          </Sticker>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-display text-base leading-tight text-fg">{deck.name}</span>
        <span className="text-xs text-fg-muted">{deck.tagline}</span>
        <span className="text-mono mt-auto pt-2 text-[0.7rem] uppercase tracking-wide text-fg-faint">
          {deck.questions.length} prompts
        </span>
      </div>
    </article>
  );
}
