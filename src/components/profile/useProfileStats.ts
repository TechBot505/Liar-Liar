"use client";

import { useMemo } from "react";
import { useHistory } from "@/components/history/useHistory";

export interface AwardBadge {
  id: string;
  label: string;
  count: number;
}

export interface ProfileStats {
  games: number;
  wins: number;
  winRate: number;
  avgRank: number;
  badges: AwardBadge[];
}

/** Aggregate the local + cloud history into headline profile stats + badges. */
export function useProfileStats(): ProfileStats {
  const { items } = useHistory();
  return useMemo(() => {
    const games = items.length;
    const ranked = items.filter((g) => g.yourRank > 0);
    const wins = ranked.filter((g) => g.yourRank === 1).length;
    const avgRank =
      ranked.length > 0 ? ranked.reduce((s, g) => s + g.yourRank, 0) / ranked.length : 0;

    const byId = new Map<string, AwardBadge>();
    for (const g of items) {
      if (!g.youId) continue;
      for (const a of g.awards) {
        if (a.playerId !== g.youId) continue;
        const prev = byId.get(a.id);
        byId.set(a.id, { id: a.id, label: a.label, count: (prev?.count ?? 0) + 1 });
      }
    }

    return {
      games,
      wins,
      winRate: games > 0 ? Math.round((wins / games) * 100) : 0,
      avgRank: Math.round(avgRank * 10) / 10,
      badges: [...byId.values()].sort((a, b) => b.count - a.count),
    };
  }, [items]);
}
