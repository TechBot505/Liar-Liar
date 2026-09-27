"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Sheet, toast } from "@/components/ui";
import { getDeck, DEFAULT_DECK_ID } from "@/decks/registry";
import { createRoom } from "@/lib/createRoom";
import type { Settings } from "@/game/types";
import { useLastSettings } from "./useLastSettings";
import { DeckPickerGrid } from "./DeckPickerGrid";
import { GameSettingsForm } from "./GameSettingsForm";

export interface CreateGameSheetProps {
  open: boolean;
  onClose: () => void;
  /** Deck to preselect when the sheet opens (e.g. from `/play?create=facts`). */
  initialDeckId?: string;
}

/** Reads the `create=<deckId>` intent from the URL (e.g. a "Play this deck" link). */
export function useCreateIntent(): string | null {
  const params = useSearchParams();
  return params.get("create");
}

/** Deck picker + settings → createRoom → navigate to the room. */
export function CreateGameSheet({ open, onClose, initialDeckId }: CreateGameSheetProps): JSX.Element {
  const router = useRouter();
  const [settings, setSettings] = useLastSettings();
  const [loading, setLoading] = useState(false);
  const applied = useRef<string | null>(null);

  // Keep the selection valid: enabling family mode can't leave an adult deck picked.
  const handleChange = (next: Settings) => {
    const deck = getDeck(next.deckId);
    if (next.familyMode && deck?.adult) next = { ...next, deckId: DEFAULT_DECK_ID };
    setSettings(next);
  };

  // Preselect the requested deck once per open; adult decks turn family mode off.
  useEffect(() => {
    if (!open) {
      applied.current = null;
      return;
    }
    if (!initialDeckId || applied.current === initialDeckId) return;
    const deck = getDeck(initialDeckId);
    if (!deck) return;
    applied.current = initialDeckId;
    setSettings({ ...settings, deckId: deck.id, familyMode: deck.adult ? false : settings.familyMode });
  }, [open, initialDeckId, settings, setSettings]);

  const create = async () => {
    setLoading(true);
    try {
      const { code } = await createRoom(settings);
      router.push(`/room/${code}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast(`Couldn’t create a room: ${msg}`, "error");
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Create a game" className="max-h-[88dvh] overflow-y-auto">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="px-1 text-xs font-medium uppercase tracking-wide text-fg-faint">Deck</span>
          <DeckPickerGrid
            selectedId={settings.deckId}
            familyMode={settings.familyMode}
            onSelect={(deckId) => handleChange({ ...settings, deckId })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="px-1 text-xs font-medium uppercase tracking-wide text-fg-faint">Settings</span>
          <GameSettingsForm settings={settings} onChange={handleChange} />
        </div>
        <Button size="lg" fullWidth loading={loading} onClick={create}>
          {loading ? "Creating room…" : "Create room"}
        </Button>
      </div>
    </Sheet>
  );
}
