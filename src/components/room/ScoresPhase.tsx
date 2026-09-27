"use client";

import { useMemo, type JSX } from "react";
import { motion } from "motion/react";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Avatar } from "@/components/avatar/Avatar";
import { Button, CountUp, ProgressDots } from "@/components/ui";
import { normalizeAvatar } from "@/lib/avatar";
import { cn } from "@/lib/cn";
import { playerLookup, rankRows } from "./util";
import { useDeadlineCountdown } from "./hooks";
import { PhaseLayout } from "./PhaseLayout";
import { ReactionBar } from "./ReactionBar";
import type { PhaseProps } from "./types";

/** SCOREBOARD — ranked list reordering by shared layout, deltas + rank arrows. */
export function ScoresPhase({ view, send, serverOffset, isHost }: PhaseProps): JSX.Element {
  const round = view.round;
  const lookup = useMemo(() => playerLookup(view.players), [view.players]);
  const secs = useDeadlineCountdown(round?.deadline, serverOffset);
  const rows = useMemo(() => {
    const scores = round?.result?.scores ?? {};
    return rankRows(view.players.map((p) => ({ id: p.id, score: p.score, delta: scores[p.id] ?? 0 })));
  }, [view.players, round]);

  const total = round?.total ?? view.settings.rounds;
  const current = round?.index ?? 0;
  const lastRound = current >= total - 1;

  const title = (
    <div className="flex items-center gap-3">
      <span className="text-display text-xl text-fg">Scoreboard</span>
      <ProgressDots total={total} current={current} label={`Round ${current + 1} of ${total}`} />
    </div>
  );
  const dock = isHost ? (
    <Button fullWidth size="lg" onClick={() => send({ type: "next" })}>
      {lastRound ? "See final" : "Next round"}
    </Button>
  ) : (
    <p className="text-center text-sm text-fg-muted">
      Waiting for host{secs > 0 ? ` · ${secs}s` : "…"}
    </p>
  );

  return (
    <PhaseLayout title={title} dock={dock} reaction={<ReactionBar send={send} />}>
      <ol className="flex flex-col gap-2">
        {rows.map((r) => {
          const p = lookup(r.id);
          if (!p) return null;
          const isMe = view.you === r.id;
          return (
            <motion.li
              layout
              key={r.id}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className={cn(
                "flex items-center gap-2.5 rounded-(--radius-card) border bg-surface p-2.5 shadow-soft",
                isMe ? "border-accent/50" : "border-line",
              )}
            >
              <span className="text-mono w-5 shrink-0 text-center text-sm text-fg-muted">{r.rank}</span>
              <RankArrow moved={r.prevRank - r.rank} />
              <Avatar config={normalizeAvatar(p.avatar)} size={34} />
              <span className="min-w-0 flex-1 truncate text-fg">
                {p.name}
                {isMe && <span className="ml-1 text-accent">you</span>}
              </span>
              {r.delta > 0 && <span className="text-mono shrink-0 text-sm text-truth">+{r.delta}</span>}
              <CountUp value={r.score} className="text-mono w-9 shrink-0 text-right text-xl text-fg" />
            </motion.li>
          );
        })}
      </ol>
    </PhaseLayout>
  );
}

function RankArrow({ moved }: { moved: number }): JSX.Element {
  if (moved > 0) return <ChevronUp className="shrink-0 text-truth" size={16} aria-label={`up ${moved}`} />;
  if (moved < 0) return <ChevronDown className="shrink-0 text-accent" size={16} aria-label={`down ${-moved}`} />;
  return <Minus className="shrink-0 text-fg-faint" size={16} aria-label="no change" />;
}
