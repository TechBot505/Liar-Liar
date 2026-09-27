import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Prefs } from "./types";

interface PrefsState extends Prefs {
  setSound: (on: boolean) => void;
  setHaptics: (on: boolean) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set, get) => ({
      sound: true,
      haptics: true,
      setSound: (on) => set({ sound: on }),
      setHaptics: (on) => set({ haptics: on }),
      toggleSound: () => set({ sound: !get().sound }),
      toggleHaptics: () => set({ haptics: !get().haptics }),
    }),
    { name: "ll:prefs" },
  ),
);

/** Read prefs without subscribing (used by imperative sound/haptics modules). */
export function getPrefs(): Prefs {
  const { sound, haptics } = usePrefsStore.getState();
  return { sound, haptics };
}
