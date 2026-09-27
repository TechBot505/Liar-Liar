"use client";

import { useEffect, useState, type JSX } from "react";
import { motion } from "motion/react";
import { Pencil } from "lucide-react";
import type { LivePhaseProps } from "./types";
import { Button, Card, Input, Sticker, TimerRing } from "@/components/ui";
import { getDeck } from "@/decks/registry";
import { PromptCard } from "./PromptCard";
import { PlayerStrip } from "./PlayerStrip";
import { PhaseLayout } from "./PhaseLayout";
import { RoundIntro } from "./RoundIntro";
import { useIsDesktop, useKeyboardInset, useTimerTicks } from "./hooks";

/** ANSWER — round intro, centered question, keyboard-aware lie dock, lock/edit. */
export function AnsweringPhase({ view, send, serverOffset, me, spectating, error }: LivePhaseProps): JSX.Element {
  const round = view.round;
  const inset = useKeyboardInset();
  const desktop = useIsDesktop();
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [shake, setShake] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  const tooClose = error?.code === "too_close";
  const submitted = !!me?.submitted;
  const isTarget = round?.kind === "player" && round.targetId === me?.id;

  useTimerTicks(round?.deadline, serverOffset, !submitted && !spectating);
  useEffect(() => {
    if (tooClose) setShake((n) => n + 1);
  }, [error, tooClose]);

  if (!round) {
    return (
      <PhaseLayout title={<Sticker>Round…</Sticker>}>
        <div className="py-12 text-center text-fg-faint">Loading round…</div>
      </PhaseLayout>
    );
  }

  const finalRound = round.index === round.total - 1;
  const deck = getDeck(round.deckId);
  const target = round.targetId ? view.players.find((p) => p.id === round.targetId) : undefined;
  const hint = isTarget ? "Write your REAL answer — no fibbing." : deck?.lieHint ?? "";
  const locked = submitted && !editing;
  const showInput = !spectating && !locked && introDone;
  const elapsedMs = (Date.now() + serverOffset) - (round.deadline - view.settings.answerSeconds * 1000);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    send({ type: "submitLie", text: t.slice(0, 60) });
    setEditing(false);
  };

  const title = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-mono text-sm text-fg-muted">Round {round.index + 1}/{round.total}</span>
      {finalRound && <Sticker tone="accent">Final ×2</Sticker>}
    </div>
  );
  const timer = (
    <TimerRing deadline={round.deadline} total={view.settings.answerSeconds} serverOffset={serverOffset} size={52} />
  );

  return (
    <>
      <RoundIntro
        roundKey={`${view.code}:${round.index}`}
        index={round.index}
        total={round.total}
        deckName={deck?.name ?? round.deckId}
        elapsedMs={elapsedMs}
        onDone={() => setIntroDone(true)}
      />
      <PhaseLayout title={title} timer={timer} contentPadBottom={showInput ? 168 : 24}>
        <div className="flex flex-col gap-4">
          <PromptCard prompt={round.prompt} isPlayerKind={round.kind === "player"} target={target} truthMode={isTarget} />

          {spectating ? (
            <Card className="flex flex-col items-center gap-2 text-center">
              <p className="text-display text-xl text-fg">You&apos;re in next round</p>
              <p className="text-sm text-fg-muted">Sit back and watch this one play out.</p>
              <PlayerStrip players={view.players} done={(p) => p.submitted} noun="answer" />
            </Card>
          ) : locked ? (
            <Card className="flex flex-col items-center gap-3 text-center">
              <Sticker tone="truth">Locked in</Sticker>
              {text && <p className="text-display text-lg text-fg">“{text}”</p>}
              <p className="text-sm text-fg-muted">Waiting for others. You can still edit.</p>
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                <Pencil size={16} aria-hidden /> Edit
              </Button>
              <PlayerStrip players={view.players} done={(p) => p.submitted} noun="answer" />
            </Card>
          ) : (
            <>
              <p className="text-center text-sm text-fg-muted">{hint}</p>
              <PlayerStrip players={view.players} done={(p) => p.submitted} noun="answer" />
            </>
          )}
        </div>

        {showInput && (
          <motion.div key={shake} animate={tooClose ? { x: [0, -10, 10, -6, 6, 0] } : undefined} transition={{ duration: 0.4 }}>
            <div
              className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/85 px-[max(20px,env(safe-area-inset-left))] pt-3 backdrop-blur [--pad-bottom:12px]"
              style={{ paddingBottom: inset + 12 }}
            >
              <div className="mx-auto flex max-w-[480px] flex-col gap-2">
                {tooClose && <p className="text-center text-sm text-accent">Too close to the truth! Try another.</p>}
                <div className="flex gap-2">
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder={isTarget ? "The truth is…" : "Your best lie…"}
                    maxLength={60}
                    counter
                    autoFocus={desktop}
                    error={tooClose ? " " : undefined}
                    aria-label="Your answer"
                  />
                  <Button size="lg" className="shrink-0" disabled={!text.trim()} onClick={submit}>
                    Submit lie
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </PhaseLayout>
    </>
  );
}
