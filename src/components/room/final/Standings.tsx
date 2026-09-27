"use client";

import type { JSX } from "react";
import type { Standing } from "@/game/types";
import { Avatar } from "@/components/avatar/Avatar";
import { normalizeAvatar } from "@/lib/avatar";
import { cn } from "@/lib/cn";

export interface StandingsProps {
  standings: Standing[];
  youId: string;
}

/** Full final standings, newest-first by rank. */
export function Standings({ standings, youId }: StandingsProps): JSX.Element {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-display text-xl text-fg">Final standings</h2>
      <ol className="flex flex-col gap-1.5">
        {standings.map((s) => {
          const isMe = s.playerId === youId;
          return (
            <li
              key={s.playerId}
              className={cn(
                "flex items-center gap-3 rounded-(--radius-card) border bg-surface p-2.5 shadow-soft",
                isMe ? "border-accent/50" : "border-line",
              )}
            >
              <span className="text-mono w-6 text-center text-sm text-fg-muted">
                {s.rank}
              </span>
              <Avatar config={normalizeAvatar(s.avatar)} size={34} />
              <span className="min-w-0 flex-1 truncate text-fg">
                {s.name}
                {isMe && <span className="ml-1 text-accent">you</span>}
              </span>
              <span className="text-mono text-lg text-fg">{s.score}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
