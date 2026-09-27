"use client";

import { useEffect, useState } from "react";
import { isAuthEnabledClient } from "@/lib/env";
import { useAuthStore } from "@/lib/store/auth";

/** Aggregate lifetime stats served by GET /api/stats for a signed-in user. */
export interface CloudStats {
  games: number;
  wins: number;
  winRate: number;
  avgRank: number;
  totalPoints: number;
  timesFooledOthers: number;
  truthsFound: number;
}

/**
 * Fetch the signed-in user's cloud stats, or null when auth is disabled, the user
 * is signed out (401), or the DB is off (503). Best-effort: any failure yields null
 * so the profile screen falls back to local, device-only stats.
 */
export function useCloudStats(): CloudStats | null {
  const [stats, setStats] = useState<CloudStats | null>(null);
  const isLoaded = useAuthStore((s) => s.isLoaded);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);

  useEffect(() => {
    // Skip the fetch entirely for guests / while Clerk loads so signed-out
    // sessions never hit /api/stats and get a 401.
    if (!isAuthEnabledClient || !isLoaded || !isSignedIn) {
      setStats(null);
      return;
    }
    let alive = true;
    void fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { data?: { stats?: CloudStats } } | null) => {
        if (alive && body?.data?.stats) setStats(body.data.stats);
      })
      .catch(() => {
        /* signed out / db off / offline — stay on local stats */
      });
    return () => {
      alive = false;
    };
  }, [isLoaded, isSignedIn]);

  return stats;
}
