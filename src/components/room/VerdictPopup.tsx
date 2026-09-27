"use client";

import { useEffect, type JSX } from "react";
import { ModalCard, Button, fireConfetti } from "@/components/ui";
import { playSound } from "@/lib/sound";
import { haptic } from "@/lib/haptics";
import { Peeps } from "./Peeps";
import type { PlayerLookup } from "./util";
import type { Verdict } from "./verdict";

export interface VerdictPopupProps {
  open: boolean;
  verdict: Verdict;
  lookup: PlayerLookup;
  /** Final round with doubling on — truth reward becomes +4. */
  isDouble: boolean;
  /** True for "Truth Comes Out"-style player decks. */
  playerKind: boolean;
  onClose: () => void;
}

const AUTO_MS = 4000;

/** Per-player reveal popup: what happened to you + who you psyched this round. */
export function VerdictPopup({
  open, verdict, lookup, isDouble, playerKind, onClose,
}: VerdictPopupProps): JSX.Element {
  const { outcome } = verdict;
  const tone = outcome === "truth" ? "truth" : outcome === "fooled" ? "fooled" : "neutral";

  useEffect(() => {
    if (!open) return;
    if (outcome === "truth") {
      playSound("correct");
      haptic("success");
      if (verdict.fooledIds.length > 0) fireConfetti();
    } else if (outcome === "fooled") {
      playSound("fooled");
      haptic("warn");
    }
    const t = setTimeout(onClose, AUTO_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const truthReward = isDouble ? 4 : 2;

  return (
    <ModalCard open={open} tone={tone}>
      <div className="flex flex-col gap-4">
        {outcome === "truth" && (
          <Headline lead="You found the " word="truth" trail="." reward={`+${truthReward}`} />
        )}
        {outcome === "fooled" && <Headline lead="You got " word="psyched" trail="." />}
        {outcome === "novote" && <h2 className="text-serif text-3xl text-fg">You didn&apos;t vote.</h2>}

        {outcome === "fooled" && (
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-fg-faint">Fooled by</span>
            <Peeps ids={verdict.foolerIds} lookup={lookup} empty="the house" />
            {verdict.pickedOption && (
              <p className="mt-1 text-fg-muted">
                You picked <span className="text-fg">“{verdict.pickedOption.text}”</span>
              </p>
            )}
          </div>
        )}

        {outcome !== "truth" && (
          <p className="text-sm text-fg-muted">
            The truth was{" "}
            <span className="text-truth">“{verdict.truthOption?.text ?? verdict.truthText}”</span>
          </p>
        )}

        <div className="h-px w-full bg-line" aria-hidden />

        {playerKind && verdict.isTarget ? (
          <p className="text-sm text-fg-muted">
            <span className="text-fg">{verdict.guessedRight}</span> of {verdict.voterTotal} guessed
            your real answer.
          </p>
        ) : (
          <SecondLine verdict={verdict} lookup={lookup} />
        )}

        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-fg-faint">This round</span>
            <span className="text-mono text-4xl font-medium tabular-nums text-fg">
              {verdict.roundPoints >= 0 ? "+" : ""}
              {verdict.roundPoints}
            </span>
          </div>
          <Button size="sm" variant="secondary" onClick={onClose}>
            See results
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}

function Headline({
  lead, word, trail, reward,
}: { lead: string; word: string; trail: string; reward?: string }): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-3">
      <h2 className="text-serif text-3xl leading-tight text-fg">
        {lead}
        <span className="text-accent">{word}</span>
        {trail}
      </h2>
      {reward && <span className="text-mono shrink-0 text-2xl text-truth">{reward}</span>}
    </div>
  );
}

function SecondLine({ verdict, lookup }: { verdict: Verdict; lookup: PlayerLookup }): JSX.Element {
  if (!verdict.yourLie) {
    return <p className="text-sm text-fg-faint">You didn&apos;t submit a lie.</p>;
  }
  if (verdict.fooledIds.length === 0) {
    return <p className="text-sm text-fg-muted">Nobody fell for your lie.</p>;
  }
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm text-fg-muted">
      You fooled
      <Peeps ids={verdict.fooledIds} lookup={lookup} />
      <span className="text-mono text-truth">+{verdict.fooledIds.length}</span>
    </p>
  );
}
