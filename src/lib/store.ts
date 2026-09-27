/**
 * Local persisted state (zustand + persist). Four localStorage keys:
 *   ll:profile · ll:seen · ll:history · ll:prefs
 * Split into ./store/* modules; re-exported here as the public surface.
 */
export { useProfileStore } from "./store/profile";
export { useSeenStore } from "./store/seen";
export { useHistoryStore } from "./store/history";
export { usePrefsStore, getPrefs } from "./store/prefs";
export { useHydrated } from "./store/hydrated";
export type {
  Profile,
  Prefs,
  GameSummary,
  HistoryPlayer,
} from "./store/types";
