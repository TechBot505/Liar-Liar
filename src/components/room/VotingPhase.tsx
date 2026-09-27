"use client";

import { useState, type JSX } from "react";
import { motion } from "motion/react";
import type { LivePhaseProps } from "./types";
import { Button, Card, Sticker, TimerRing } from "@/components/ui";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/cn";
import { PlayerStrip } from "./PlayerStrip";
import { PhaseLayout } from "./PhaseLayout";
import { ReactionBar } from "./ReactionBar";
import { useTimerTicks } from "./hooks";

/** VOTE — pick the truth from clean rows (single tap + Lock answer), or spectate. */
export function VotingPhase({ view, send, serverOffset, me, spectating }: LivePhaseProps): JSX.Element {
  const round = view.round;
  const [selected, setSelected] = useState<string | null>(null);
  const voted = !!me?.voted;
  const isTarget = round?.kind === "player" && round.targetId === me?.id;

  useTimerTicks(round?.deadline, serverOffset, !voted && !isTarget && !spectating);

  const title = <Sticker tone="accent">Which one is true?</Sticker>;
  const reaction = <ReactionBar send={send} />;

  if (!round) {
    return (
      <PhaseLayout title={title} reaction={reaction}>
        <div className="py-12 text-center text-fg-faint">Tallying answers…</div>
      </PhaseLayout>
    );
  }

  const options = round.options ?? [];
  const targetId = round.kind === "player" ? round.targetId : undefined;
  const timer = (
    <TimerRing deadline={round.deadline} total={view.settings.voteSeconds} serverOffset={serverOffset} size={52} />
  );
  const strip = <PlayerStrip players={view.players} done={(p) => p.voted} noun="vote" excludeId={targetId} />;

  const select = (id: string) => {
    if (voted) return;
    haptic("select");
    setSelected(id);
  };
  const lock = () => {
    if (!selected || voted) return;
    send({ type: "vote", optionId: selected });
  };

  if (isTarget || spectating) {
    return (
      <PhaseLayout title={title} timer={timer} reaction={reaction}>
        <div className="flex flex-col gap-4">
          <Card className="text-center">
            <p className="text-display text-xl text-fg">
              {isTarget ? "They're guessing your answer" : "You'll join next round"}
            </p>
          </Card>
          {strip}
        </div>
      </PhaseLayout>
    );
  }

  const dock = voted ? (
    <p className="text-center text-sm text-fg-muted">Locked — waiting for others…</p>
  ) : (
    <Button fullWidth size="lg" disabled={!selected} onClick={lock}>
      Lock answer
    </Button>
  );

  return (
    <PhaseLayout title={title} timer={timer} dock={dock} reaction={reaction}>
      <ul className="flex flex-col gap-2.5">
        {options.map((o, i) => {
          const mine = o.id === round.yourLieOptionId;
          const isSel = selected === o.id;
          return (
            <motion.li
              key={o.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 30, delay: i * 0.05 }}
            >
              <button
                type="button"
                disabled={mine || voted}
                aria-pressed={isSel}
                onClick={() => select(o.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-(--radius-card) border bg-surface px-4 py-4 text-left shadow-soft transition-colors",
                  isSel ? "border-accent" : "border-line",
                  mine && "opacity-50",
                )}
              >
                <span className="min-w-0 flex-1 break-words text-base text-fg">{o.text}</span>
                {mine ? (
                  <Sticker>Your lie</Sticker>
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      "size-3.5 shrink-0 rounded-full border transition-colors",
                      isSel ? "border-accent bg-accent" : "border-line",
                    )}
                  />
                )}
              </button>
            </motion.li>
          );
        })}
      </ul>
      <div className="mt-4">{strip}</div>
    </PhaseLayout>
  );
}
