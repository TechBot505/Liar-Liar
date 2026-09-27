"use client";

import type { JSX } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { PlayerView } from "@/game/types";
import { Avatar } from "@/components/avatar/Avatar";
import { normalizeAvatar } from "@/lib/avatar";

export interface PlayerStripProps {
  players: PlayerView[];
  /** Marks a player as "done" (submitted / voted) — shows a check + full opacity. */
  done: (p: PlayerView) => boolean;
  /** Verb for the waiting hint, e.g. "submit" → "Waiting for 2 more…". */
  noun?: string;
  /** Player id to exclude from the waiting count (e.g. the round target while voting). */
  excludeId?: string;
}

/** Join names as "Ann", "Ann & Bob", or "Ann, Bob & Cat". */
function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

/** Compact avatar row showing who has acted this phase, with a live waiting hint. */
export function PlayerStrip({ players, done, noun = "player", excludeId }: PlayerStripProps): JSX.Element {
  // Count only ACTIVE, CONNECTED players who still owe an action: exclude the
  // disconnected, the passed-in target, and anyone who has already acted.
  const pending = players.filter(
    (p) => p.connected && p.id !== excludeId && !done(p),
  );
  const names = pending.map((p) => p.name);
  const eligible = players.filter((p) => p.connected && p.id !== excludeId).length;
  const doneCount = eligible - pending.length;
  const hint =
    pending.length === 0
      ? "Everyone's in!"
      : pending.length <= 2
        ? `Waiting for ${joinNames(names)}…`
        : doneCount === 0
          ? `Waiting for everyone · 0/${eligible}`
          : `${doneCount}/${eligible} done · waiting for ${pending.length} more…`;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        {players.map((p) => {
          const ok = done(p);
          return (
            <motion.div
              key={p.id}
              layout
              className="relative"
              animate={{ opacity: ok ? 1 : 0.4, scale: ok ? 1 : 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
            >
              <Avatar config={normalizeAvatar(p.avatar)} size={40} title={p.name} />
              {ok && (
                <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-bg bg-truth text-accent-fg">
                  <Check size={11} strokeWidth={3} aria-hidden />
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
      <p aria-live="polite" className="text-sm text-fg-muted">
        {hint}
      </p>
      <span className="sr-only">{noun}</span>
    </div>
  );
}
