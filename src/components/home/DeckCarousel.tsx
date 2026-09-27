"use client";

import type { JSX } from "react";
import Link from "next/link";
import { listDecks } from "@/decks/registry";
import { DeckTile } from "@/components/decks/DeckTile";

/** Clean, snap-scrolling horizontal row of animated deck tiles. */
export function DeckCarousel(): JSX.Element {
  const decks = listDecks().filter((d) => !d.adult);
  return (
    <section className="flex flex-col gap-3" aria-label="Deck preview">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-medium uppercase tracking-wide text-fg-faint">Decks</h2>
        <Link
          href="/decks"
          className="-my-3 inline-flex min-h-11 items-center text-sm font-medium text-fg-muted transition-colors hover:text-fg"
        >
          See all →
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1">
        {decks.map((deck) => (
          <Link
            key={deck.id}
            href={`/play?create=${deck.id}`}
            className="w-44 shrink-0 snap-start rounded-(--radius-card) focus-visible:outline-none"
            aria-label={`Play ${deck.name}`}
          >
            <DeckTile deck={deck} className="h-full w-full" />
          </Link>
        ))}
        {/* Trailing spacer so the last tile clears the right gutter when scrolled. */}
        <span aria-hidden className="w-1 shrink-0" />
      </div>
    </section>
  );
}
