import type { JSX } from "react";
import { Lock } from "lucide-react";
import type { Deck } from "@/decks/types";
import { Sticker } from "@/components/ui";
import { cn } from "@/lib/cn";
import { DeckArt } from "./DeckArt";

export interface DeckRowProps {
  deck: Deck;
  selected: boolean;
  blocked?: boolean;
  onSelect: () => void;
}

/** Selectable row for pickers: small art thumbnail + name + tagline + count + radio ring. */
export function DeckRow({ deck, selected, blocked, onSelect }: DeckRowProps): JSX.Element {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${deck.name} — ${deck.questions.length} prompts`}
      disabled={blocked}
      onClick={blocked ? undefined : onSelect}
      className={cn(
        "no-tap-highlight flex items-center gap-3 rounded-(--radius-card) border bg-surface p-2.5 text-left transition-colors",
        selected ? "border-accent ring-1 ring-accent" : "border-line hover:bg-surface-2",
        blocked && "opacity-45",
      )}
    >
      <DeckArt deckId={deck.id} size="sm" animated={selected} className="size-14 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium tracking-tight text-fg">{deck.name}</span>
        <span className="truncate text-xs text-fg-muted">
          {blocked ? "Turn off family mode" : deck.tagline}
        </span>
        <span className="text-mono text-[0.65rem] uppercase tracking-wide text-fg-faint">
          {deck.questions.length} prompts
        </span>
      </div>
      {blocked ? (
        <Lock size={15} className="mr-1 shrink-0 text-fg-faint" aria-hidden />
      ) : (
        <span
          aria-hidden
          className={cn(
            "mr-1 grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
            selected ? "border-accent" : "border-line",
          )}
        >
          {selected && <span className="size-2.5 rounded-full bg-accent" />}
        </span>
      )}
      {deck.adult && !blocked && (
        <Sticker tone="accent" className="shrink-0 px-2 py-0.5 text-[0.6rem]">
          18+
        </Sticker>
      )}
    </button>
  );
}
