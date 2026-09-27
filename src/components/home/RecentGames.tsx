"use client";

import type { JSX } from "react";
import Link from "next/link";
import { AvatarStack, Sticker } from "@/components/ui";
import { useHistoryStore } from "@/lib/store/history";
import { getDeck } from "@/decks/registry";

/** Renders the player's last few games as rows; nothing when history is empty. */
export function RecentGames(): JSX.Element | null {
  const games = useHistoryStore((s) => s.games);
  if (games.length === 0) return null;

  const recent = games.slice(0, 3);
  return (
    <section className="flex flex-col gap-3" aria-label="Recent games">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-sm font-medium uppercase tracking-wide text-fg-faint">Recent games</h2>
        <Link href="/history" className="text-sm font-medium text-fg-muted transition-colors hover:text-fg">
          All →
        </Link>
      </div>
      <ul className="flex flex-col">
        {recent.map((g) => {
          const deck = getDeck(g.deckId);
          const won = g.yourRank === 1;
          return (
            <li key={g.id}>
              <Link
                href={`/history/${g.id}`}
                className="no-tap-highlight flex items-center gap-3 border-t border-line py-3"
              >
                <span
                  className="flex size-9 items-center justify-center rounded-(--radius-input) border border-line bg-surface-2 text-lg"
                  aria-hidden
                >
                  {deck?.emoji ?? "🎲"}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium tracking-tight text-fg">
                    {deck?.name ?? "Custom game"}
                  </span>
                  <span className="text-xs text-fg-muted">{g.players.length} players</span>
                </div>
                {g.yourRank ? (
                  <Sticker tone={won ? "accent" : "neutral"}>{won ? "Won" : `#${g.yourRank}`}</Sticker>
                ) : null}
                <AvatarStack
                  players={g.players.map((p, i) => ({ id: `${g.id}-${i}`, avatar: p.avatar, name: p.name }))}
                  max={4}
                  size={28}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
