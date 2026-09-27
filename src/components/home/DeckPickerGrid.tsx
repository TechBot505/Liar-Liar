"use client";

import type { JSX } from "react";
import { listDecks } from "@/decks/registry";
import { DeckRow } from "@/components/decks/DeckRow";

export interface DeckPickerGridProps {
  selectedId: string;
  familyMode: boolean;
  onSelect: (deckId: string) => void;
}

/** Vertical list of selectable deck rows — accent ring on the chosen one. */
export function DeckPickerGrid({ selectedId, familyMode, onSelect }: DeckPickerGridProps): JSX.Element {
  const decks = listDecks();
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label="Choose a deck">
      {decks.map((deck) => (
        <DeckRow
          key={deck.id}
          deck={deck}
          selected={selectedId === deck.id}
          blocked={familyMode && !!deck.adult}
          onSelect={() => onSelect(deck.id)}
        />
      ))}
    </div>
  );
}
