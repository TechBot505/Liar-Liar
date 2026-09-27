import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameSummary } from "./types";

const HISTORY_CAP = 50;

interface HistoryState {
  games: GameSummary[];
  /** Prepend a finished game; de-dupes by id and keeps the last 50. */
  addGame: (summary: GameSummary) => void;
  getGame: (id: string) => GameSummary | undefined;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      games: [],
      addGame: (summary) => {
        const rest = get().games.filter((g) => g.id !== summary.id);
        set({ games: [summary, ...rest].slice(0, HISTORY_CAP) });
      },
      getGame: (id) => get().games.find((g) => g.id === id),
      clear: () => set({ games: [] }),
    }),
    { name: "ll:history" },
  ),
);
