"use client";

import { useCallback, useState } from "react";
import type { Settings } from "@/game/types";
import { DEFAULT_DECK_ID } from "@/decks/registry";

const KEY = "ll:lastSettings";

/** Sensible first-time defaults (mirrors the server-side settings defaults). */
export const DEFAULT_SETTINGS: Settings = {
  deckId: DEFAULT_DECK_ID,
  rounds: 7,
  answerSeconds: 60,
  voteSeconds: 30,
  doubleFinal: true,
  familyMode: true,
};

const ROUNDS = [5, 7, 10];
const ANSWER = [30, 45, 60, 90];
const VOTE = [20, 30, 45];

/** Coerce arbitrary parsed JSON into a valid Settings object. */
function coerce(raw: unknown): Settings {
  if (!raw || typeof raw !== "object") return DEFAULT_SETTINGS;
  const r = raw as Record<string, unknown>;
  return {
    deckId: typeof r.deckId === "string" ? r.deckId : DEFAULT_SETTINGS.deckId,
    rounds: (ROUNDS.includes(r.rounds as number) ? r.rounds : 7) as Settings["rounds"],
    answerSeconds: (ANSWER.includes(r.answerSeconds as number)
      ? r.answerSeconds
      : 60) as Settings["answerSeconds"],
    voteSeconds: (VOTE.includes(r.voteSeconds as number) ? r.voteSeconds : 30) as Settings["voteSeconds"],
    doubleFinal: typeof r.doubleFinal === "boolean" ? r.doubleFinal : true,
    familyMode: typeof r.familyMode === "boolean" ? r.familyMode : true,
  };
}

/** Load the last-used game settings and a setter that persists them. */
export function useLastSettings(): [Settings, (next: Settings) => void] {
  const [settings, set] = useState<Settings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const stored = window.localStorage.getItem(KEY);
      return stored ? coerce(JSON.parse(stored)) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const update = useCallback((next: Settings) => {
    set(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore quota / privacy-mode failures */
    }
  }, []);

  return [settings, update];
}
