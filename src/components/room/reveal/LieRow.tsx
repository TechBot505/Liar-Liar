"use client";

import type { JSX } from "react";
import { motion } from "motion/react";
import type { OptionResult } from "@/game/types";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Peeps } from "../Peeps";
import type { PlayerLookup } from "../util";

export interface LieRowProps {
  lie: OptionResult;
  lookup: PlayerLookup;
  youId: string;
  index: number;
}

/** One lie: its text, who wrote it, who it fooled, and points to the author. */
export function LieRow({ lie, lookup, youId, index }: LieRowProps): JSX.Element {
  const mine = lie.authorIds.includes(youId);
  const fooled = lie.voterIds.length;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 360, damping: 30, delay: 0.05 + index * 0.07 }}
    >
      <Card padding="sm" className={cn(mine && "border-accent/40 bg-accent/[0.06]")}>
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 break-words text-base text-fg">{lie.text}</p>
          <span className="text-mono shrink-0 text-sm text-fg-muted">+{fooled}</span>
        </div>
        <div className="mt-2 flex flex-col gap-1 text-sm text-fg-muted">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-fg-faint">by</span>
            <Peeps ids={lie.authorIds} lookup={lookup} empty="the house" />
            {mine && <span className="text-accent">you</span>}
          </span>
          {fooled > 0 ? (
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="text-fg-faint">fooled</span>
              <Peeps ids={lie.voterIds} lookup={lookup} />
            </span>
          ) : (
            <span className="text-fg-faint">fooled nobody</span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
