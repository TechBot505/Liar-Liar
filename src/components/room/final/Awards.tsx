"use client";

import type { JSX } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Award } from "@/game/types";
import { Avatar } from "@/components/avatar/Avatar";
import { Card } from "@/components/ui";
import { normalizeAvatar } from "@/lib/avatar";
import type { PlayerLookup } from "../util";
import { awardMeta, awardSubtitle } from "./awardMeta";

export interface AwardsProps {
  awards: Award[];
  lookup: PlayerLookup;
}

/** Awards as a clean 2-column grid: icon line + title + winner + one-line stat. */
export function Awards({ awards, lookup }: AwardsProps): JSX.Element {
  const reduce = useReducedMotion();
  if (awards.length === 0) return <></>;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-display text-xl text-fg">Awards</h2>
      <div className="grid grid-cols-2 gap-2">
        {awards.map((a, i) => {
          const meta = awardMeta(a.id);
          const winner = lookup(a.playerId);
          return (
            <motion.div
              key={a.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 30, delay: i * 0.06 }}
            >
              <Card padding="sm" className="flex h-full flex-col gap-1.5">
                <span className="text-xl" aria-hidden>{meta.emoji}</span>
                <p className="text-sm text-fg">{a.label}</p>
                {winner && (
                  <div className="flex items-center gap-1.5">
                    <Avatar config={normalizeAvatar(winner.avatar)} size={20} />
                    <span className="min-w-0 truncate text-sm text-fg-muted">{winner.name}</span>
                  </div>
                )}
                <p className="text-xs text-fg-faint">{awardSubtitle(a, lookup)}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
