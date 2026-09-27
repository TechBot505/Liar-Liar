"use client";

import type { JSX } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Crown } from "lucide-react";
import type { Standing } from "@/game/types";
import { Avatar } from "@/components/avatar/Avatar";
import { normalizeAvatar } from "@/lib/avatar";
import { cn } from "@/lib/cn";

export interface PodiumProps {
  standings: Standing[];
}

/** Group standings by rank value (ties share a rank), top 3 rank steps. */
function stepsByRank(standings: Standing[]): { rank: number; players: Standing[] }[] {
  const byRank = new Map<number, Standing[]>();
  for (const s of standings) {
    const arr = byRank.get(s.rank);
    if (arr) arr.push(s);
    else byRank.set(s.rank, [s]);
  }
  return [...byRank.entries()].sort((a, b) => a[0] - b[0]).slice(0, 3)
    .map(([rank, players]) => ({ rank, players }));
}

const MEDAL = ["🥇", "🥈", "🥉"];

/** Top-3 row: winner step is emphasized with a crown; tied players share a step. */
export function Podium({ standings }: PodiumProps): JSX.Element {
  const reduce = useReducedMotion();
  const steps = stepsByRank(standings);

  return (
    <div className="flex items-start justify-center gap-6">
      {steps.map((step, pos) => (
        <motion.div
          key={step.rank}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.08 + pos * 0.08,
            type: "spring",
            stiffness: 380,
            damping: 30,
            opacity: { type: "tween", duration: 0.3, delay: 0.08 + pos * 0.08 },
          }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-lg" aria-hidden>{MEDAL[pos]}</span>
          <div className="flex flex-wrap items-end justify-center gap-1">
            {step.players.map((s) => (
              <div key={s.playerId} className="flex flex-col items-center">
                <div className="relative">
                  {pos === 0 && (
                    <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 text-accent" size={18} aria-hidden />
                  )}
                  <Avatar
                    config={normalizeAvatar(s.avatar)}
                    size={pos === 0 ? 64 : 48}
                    ring
                    mood={pos === 0 ? "smug" : "happy"}
                  />
                </div>
                <span className={cn("mt-1 max-w-[5rem] truncate text-sm text-fg", pos === 0 && "text-base")}>
                  {s.name}
                </span>
              </div>
            ))}
          </div>
          <span className="text-mono text-xs text-fg-muted">{step.players[0].score} pts</span>
        </motion.div>
      ))}
    </div>
  );
}
