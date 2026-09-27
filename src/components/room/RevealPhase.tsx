"use client";

import { useMemo, useState, type JSX } from "react";
import { getDeck } from "@/decks/registry";
import { Button, Sticker } from "@/components/ui";
import { liesByImpact, deriveVerdict } from "./verdict";
import { playerLookup } from "./util";
import { useDeadlineCountdown } from "./hooks";
import { TruthCard } from "./reveal/TruthCard";
import { LieRow } from "./reveal/LieRow";
import { VerdictPopup } from "./VerdictPopup";
import { PhaseLayout } from "./PhaseLayout";
import { ReactionBar } from "./ReactionBar";
import type { PhaseProps } from "./types";

/** RESULTS — personalized verdict popup, then a calm "who did what" breakdown. */
export function RevealPhase({ view, send, serverOffset, isHost }: PhaseProps): JSX.Element {
  const round = view.round;
  const result = round?.result;
  const lookup = useMemo(() => playerLookup(view.players), [view.players]);
  const [popupOpen, setPopupOpen] = useState(true);
  const secs = useDeadlineCountdown(round?.deadline, serverOffset);

  const title = <Sticker tone="neutral">Results</Sticker>;
  const reaction = <ReactionBar send={send} />;

  if (!round || !result) {
    return (
      <PhaseLayout title={title} reaction={reaction}>
        <div className="grid place-items-center py-16 text-fg-faint">Tallying…</div>
      </PhaseLayout>
    );
  }

  const verdict = deriveVerdict(result, view.you);
  const isFinal = round.index === round.total - 1;
  const isDouble = isFinal && view.settings.doubleFinal;
  const truth = result.options.find((o) => o.isTruth);
  const lies = liesByImpact(result);
  const targetName = round.targetId ? lookup(round.targetId)?.name : undefined;
  const funFact = getDeck(result.deckId)?.questions.find((q) => q.id === result.questionId)?.note;

  const dock = isHost ? (
    <Button fullWidth size="lg" onClick={() => send({ type: "next" })}>
      Continue
    </Button>
  ) : (
    <p className="text-center text-sm text-fg-muted">
      Waiting for host{secs > 0 ? ` · auto-advances in ${secs}s` : "…"}
    </p>
  );

  return (
    <>
      <VerdictPopup
        open={popupOpen}
        verdict={verdict}
        lookup={lookup}
        isDouble={isDouble}
        playerKind={round.kind === "player"}
        onClose={() => setPopupOpen(false)}
      />
      <PhaseLayout title={title} prompt={round.prompt} dock={dock} reaction={reaction}>
        <div className="flex flex-col gap-3">
          {truth && (
            <TruthCard
              truth={truth}
              lookup={lookup}
              kind={round.kind}
              targetName={targetName}
              reward={isDouble ? 4 : 2}
              funFact={funFact}
              youId={view.you}
            />
          )}
          {lies.map((lie, i) => (
            <LieRow key={lie.id} lie={lie} lookup={lookup} youId={view.you} index={i} />
          ))}
        </div>
      </PhaseLayout>
    </>
  );
}
