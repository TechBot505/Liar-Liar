"use client";

import { useEffect, useMemo, useState } from "react";
import { isAuthEnabledClient } from "@/lib/env";
import { normalizeAvatar } from "@/lib/avatar";
import { useHistoryStore, useHydrated, type GameSummary } from "@/lib/store";
import { useAuthStore } from "@/lib/store/auth";
import { historyKey, type HistoryItem } from "./types";

interface CloudPlayer {
  name: string;
  avatar: unknown;
  score: number;
  rank: number;
  userId: string | null;
}
interface CloudGame {
  id: string;
  code: string;
  deckId: string;
  endedAt: string;
  players: CloudPlayer[];
}

function fromLocal(g: GameSummary): HistoryItem {
  return {
    id: g.id,
    code: g.code,
    deckId: g.deckId,
    playedAt: g.playedAt,
    players: g.players.map((p) => ({ ...p, avatar: normalizeAvatar(p.avatar) })),
    yourRank: g.yourRank,
    youId: g.youId,
    awards: g.awards,
    source: "local",
  };
}

function fromCloud(g: CloudGame): HistoryItem {
  const players = g.players
    .map((p) => ({
      name: p.name,
      avatar: normalizeAvatar(p.avatar),
      score: p.score,
      rank: p.rank,
      isYou: Boolean(p.userId),
    }))
    .sort((a, b) => a.rank - b.rank);
  const you = players.find((p) => p.isYou);
  return {
    id: g.id,
    code: g.code,
    deckId: g.deckId,
    playedAt: Date.parse(g.endedAt) || 0,
    players,
    yourRank: you?.rank ?? 0,
    awards: [],
    source: "cloud",
  };
}

/** Event name used to invalidate/refresh the signed-in user's cloud history. */
const HISTORY_REFRESH_EVENT = "ll:history-refresh";

/** Ask any mounted history views to re-fetch cloud history (no-op on the server). */
export function requestHistoryRefresh(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(HISTORY_REFRESH_EVENT));
  }
}

/** Local history merged with the signed-in user's cloud history (deduped). */
export function useHistory(): { items: HistoryItem[]; loading: boolean } {
  const hydrated = useHydrated();
  const local = useHistoryStore((s) => s.games);
  const [cloud, setCloud] = useState<HistoryItem[] | null>(null);
  const isLoaded = useAuthStore((s) => s.isLoaded);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);

  useEffect(() => {
    // Only signed-in users have cloud history; skip while guest/loading so we
    // never fire an unauthenticated /api/history that just 401s.
    if (!isAuthEnabledClient || !isLoaded || !isSignedIn) {
      setCloud(null);
      return;
    }
    let alive = true;
    const load = (): void => {
      void fetch("/api/history")
        .then((r) => (r.ok ? r.json() : null))
        .then((body: { data?: { games?: CloudGame[] } } | null) => {
          if (alive && body?.data?.games) setCloud(body.data.games.map(fromCloud));
        })
        .catch(() => {
          /* 401/503/offline — cloud stays empty */
        });
    };
    load();
    window.addEventListener(HISTORY_REFRESH_EVENT, load);
    return () => {
      alive = false;
      window.removeEventListener(HISTORY_REFRESH_EVENT, load);
    };
  }, [isLoaded, isSignedIn]);

  const items = useMemo(() => {
    const map = new Map<string, HistoryItem>();
    for (const g of (cloud ?? [])) map.set(historyKey(g), g);
    for (const g of local.map(fromLocal)) map.set(historyKey(g), g); // local wins
    return [...map.values()].sort((a, b) => b.playedAt - a.playedAt);
  }, [local, cloud]);

  return { items, loading: !hydrated };
}
