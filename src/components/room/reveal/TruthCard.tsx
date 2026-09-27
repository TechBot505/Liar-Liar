"use client";

import type { JSX } from "react";
import { motion } from "motion/react";
import type { DeckKind } from "@/decks/types";
import type { OptionResult } from "@/game/types";
import { Card } from "@/components/ui";
import { Peeps } from "../Peeps";
import type { PlayerLookup } from "../util";

export interface TruthCardProps {
  truth: OptionResult;
  lookup: PlayerLookup;
  kind: DeckKind;
  targetName?: string;
  reward: number;
  funFact?: string;
  youId: string;
}

/** The truth, highlighted with a mint accent line + who found it. */
export function TruthCard({
  truth, lookup, kind, targetName, reward, funFact, youId,
}: TruthCardProps): JSX.Element {
  const label = kind === "player" ? `What ${targetName ?? "they"} really said` : "The truth";
  const youFound = truth.voterIds.includes(youId);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
    >
      <Card padding="none" className="overflow-hidden border-truth/40">
        <div className="flex gap-3 p-4">
          <span className="w-0.5 shrink-0 self-stretch rounded-full bg-truth" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wide text-truth">{label}</span>
              {youFound && <span className="text-xs text-fg-faint">you</span>}
            </div>
            <p className="mt-1 break-words text-display text-xl text-fg">{truth.text}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              {truth.voterIds.length > 0 ? (
                <>
                  <Peeps ids={truth.voterIds} lookup={lookup} />
                  <span className="text-mono text-truth">+{reward} each</span>
                </>
              ) : (
                <span className="text-fg-faint">Nobody found it.</span>
              )}
            </div>
          </div>
        </div>
        {funFact && (
          <p className="border-t border-line px-4 py-3 text-sm text-fg-muted">{funFact}</p>
        )}
      </Card>
    </motion.div>
  );
}
