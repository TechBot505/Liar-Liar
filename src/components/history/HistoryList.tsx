"use client";

import type { JSX } from "react";
import Link from "next/link";
import { History as HistoryIcon } from "lucide-react";
import { getDeck } from "@/decks/registry";
import { AvatarStack, Button, Sticker } from "@/components/ui";
import { PageTitle } from "@/components/shell/PageTitle";
import { useHistory } from "./useHistory";
import type { HistoryItem } from "./types";

function timeAgo(ms: number): string {
  const d = Date.now() - ms;
  const day = 86_400_000;
  if (d < 3_600_000) return `${Math.max(1, Math.round(d / 60_000))}m ago`;
  if (d < day) return `${Math.round(d / 3_600_000)}h ago`;
  if (d < 7 * day) return `${Math.round(d / day)}d ago`;
  return new Date(ms).toLocaleDateString();
}

/** The /history screen: local + cloud games with an elegant empty state. */
export function HistoryList(): JSX.Element {
  const { items } = useHistory();

  return (
    <>
      <PageTitle eyebrow="Your games">History</PageTitle>

      {items.length === 0 ? (
        <div className="mt-20 flex flex-col items-center gap-4 text-center">
          <HistoryIcon size={40} className="text-fg-faint" aria-hidden />
          <h2 className="text-display text-xl text-fg">No games yet</h2>
          <p className="max-w-xs text-sm text-fg-muted">
            Play a round and your victories — and humbling defeats — will show up here.
          </p>
          <Link href="/play">
            <Button size="lg">Create a game</Button>
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col">
          {items.map((g) => (
            <li key={g.id}>
              <Link
                href={`/history/${g.id}`}
                className="no-tap-highlight flex items-center gap-3 border-t border-line py-3"
              >
                <span
                  className="flex size-9 items-center justify-center rounded-(--radius-input) border border-line bg-surface-2 text-lg"
                  aria-hidden
                >
                  {getDeck(g.deckId)?.emoji ?? "🎭"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium tracking-tight text-fg">
                    {getDeck(g.deckId)?.name ?? g.deckId}
                  </p>
                  <p className="text-xs text-fg-muted">{timeAgo(g.playedAt)}</p>
                </div>
                <RankPill item={g} />
                <AvatarStack
                  players={g.players.map((p, i) => ({ id: String(i), avatar: p.avatar, name: p.name }))}
                  size={28}
                  max={4}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function RankPill({ item }: { item: HistoryItem }): JSX.Element | null {
  if (!item.yourRank) return null;
  const win = item.yourRank === 1;
  return <Sticker tone={win ? "accent" : "neutral"}>{win ? "Won" : `#${item.yourRank}`}</Sticker>;
}
