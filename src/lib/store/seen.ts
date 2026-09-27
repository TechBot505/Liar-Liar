import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Newest-first cap of remembered ids per deck (keeps selection variety high). */
const PER_DECK_CAP = 400;

interface SeenState {
  /** deckId → seen question ids (newest first). */
  seen: Record<string, string[]>;
  /** Append newly-seen ids for a deck, de-duped and capped at 400. */
  addSeen: (deckId: string, ids: string[]) => void;
  /** Flattened, capped list across all decks for the `join` message. */
  allSeen: (cap?: number) => string[];
}

export const useSeenStore = create<SeenState>()(
  persist(
    (set, get) => ({
      seen: {},
      addSeen: (deckId, ids) => {
        if (ids.length === 0) return;
        const prev = get().seen[deckId] ?? [];
        const merged = [...ids, ...prev];
        const deduped = Array.from(new Set(merged)).slice(0, PER_DECK_CAP);
        set({ seen: { ...get().seen, [deckId]: deduped } });
      },
      allSeen: (cap = 800) => {
        const flat = Object.values(get().seen).flat();
        return Array.from(new Set(flat)).slice(0, cap);
      },
    }),
    { name: "ll:seen" },
  ),
);
