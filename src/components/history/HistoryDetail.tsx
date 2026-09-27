"use client";

import { useEffect, useState, type JSX } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getDeck } from "@/decks/registry";
import { Avatar } from "@/components/avatar/Avatar";
import { Sticker, Spinner } from "@/components/ui";
import { isAuthEnabledClient } from "@/lib/env";
import { normalizeAvatar } from "@/lib/avatar";
import { useHistoryStore } from "@/lib/store";
import { awardMeta } from "@/components/room/final/awardMeta";
import { cn } from "@/lib/cn";
import type { HistoryItem } from "./types";

type State = { status: "loading" } | { status: "missing" } | { status: "ok"; item: HistoryItem };

interface CloudGame {
  id: string; code: string; deckId: string; endedAt: string;
  players: { name: string; avatar: unknown; score: number; rank: number; userId: string | null }[];
}

/** /history/[id] — standings + awards for one past game (local, cloud fallback). */
export function HistoryDetail({ id }: { id: string }): JSX.Element {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const local = useHistoryStore.getState().getGame(id);
    if (local) {
      setState({
        status: "ok",
        item: {
          ...local,
          players: local.players.map((p) => ({ ...p, avatar: normalizeAvatar(p.avatar) })),
          source: "local",
        },
      });
      return;
    }
    if (!isAuthEnabledClient) return setState({ status: "missing" });
    void fetch("/api/history")
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { data?: { games?: CloudGame[] } } | null) => {
        const g = body?.data?.games?.find((x) => x.id === id);
        if (!g) return setState({ status: "missing" });
        const players = g.players
          .map((p) => ({ name: p.name, avatar: normalizeAvatar(p.avatar), score: p.score, rank: p.rank, isYou: Boolean(p.userId) }))
          .sort((a, b) => a.rank - b.rank);
        setState({
          status: "ok",
          item: { id: g.id, code: g.code, deckId: g.deckId, playedAt: Date.parse(g.endedAt) || 0, players, yourRank: players.find((p) => p.isYou)?.rank ?? 0, awards: [], source: "cloud" },
        });
      })
      .catch(() => setState({ status: "missing" }));
  }, [id]);

  if (state.status === "loading") {
    return <div className="grid place-items-center py-20 text-fg"><Spinner size={32} /></div>;
  }
  if (state.status === "missing") {
    return (
      <div className="grid place-items-center gap-4 py-20 text-center">
        <div>
          <h1 className="text-display text-2xl text-fg">Game not found</h1>
          <Link href="/history" className="mt-4 inline-block text-sm font-medium text-fg-muted transition-colors hover:text-fg">← Back to history</Link>
        </div>
      </div>
    );
  }

  const { item } = state;
  const deck = getDeck(item.deckId);
  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Link href="/history" aria-label="Back to history" className="text-fg-muted transition-colors hover:text-fg"><ChevronLeft size={26} /></Link>
        <span className="flex size-10 items-center justify-center rounded-(--radius-input) border border-line bg-surface-2 text-xl" aria-hidden>{deck?.emoji ?? "🎭"}</span>
        <div>
          <h1 className="text-display text-xl text-fg">{deck?.name ?? item.deckId}</h1>
          <p className="text-xs text-fg-muted">{new Date(item.playedAt).toLocaleString()}</p>
        </div>
      </header>

      <ol className="flex flex-col gap-2">
        {item.players.map((p, i) => (
          <li key={i} className={cn("flex items-center gap-3 rounded-(--radius-card) border bg-surface p-3", p.isYou ? "border-accent" : "border-line")}>
            <span className="text-mono w-6 text-center text-sm text-fg-faint">{p.rank}</span>
            <Avatar config={p.avatar} size={36} mood={p.rank === 1 ? "happy" : "idle"} />
            <span className="min-w-0 flex-1 truncate font-medium tracking-tight text-fg">
              {p.name}{p.isYou && <span className="ml-1 text-accent">(you)</span>}
            </span>
            <span className="text-mono text-lg font-medium text-fg">{p.score}</span>
          </li>
        ))}
      </ol>

      {item.awards.length > 0 && (
        <section className="flex flex-wrap gap-2">
          {item.awards.map((a) => {
            const who = item.players.find((p) => p.id === a.playerId)?.name;
            return (
              <Sticker key={a.id} tone="neutral">
                {awardMeta(a.id).emoji} {a.label}{who ? ` · ${who}` : ""}
              </Sticker>
            );
          })}
        </section>
      )}
    </div>
  );
}
