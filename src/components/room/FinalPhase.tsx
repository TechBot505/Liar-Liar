"use client";

import { useEffect, useMemo, useRef, type JSX } from "react";
import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";
import { Button, fireConfetti } from "@/components/ui";
import { isAuthEnabledClient } from "@/lib/env";
import { useHistoryStore } from "@/lib/store";
import { joinNames, playerLookup } from "./util";
import { Podium } from "./final/Podium";
import { Awards } from "./final/Awards";
import { Standings } from "./final/Standings";
import { ClaimSeat } from "./final/ClaimSeat";
import { toGameSummary } from "./final/toSummary";
import { ResultCard } from "@/components/share/ResultCard";
import { PhaseLayout } from "./PhaseLayout";
import type { PhaseProps } from "./types";

/** FINAL — winner reveal, podium, awards, standings, and end-of-game actions. */
export function FinalPhase({ view, send, isHost }: PhaseProps): JSX.Element {
  const final = view.final;
  const lookup = useMemo(() => playerLookup(view.players), [view.players]);
  const saved = useRef(false);
  const celebrated = useRef(false);

  useEffect(() => {
    if (!final || saved.current) return;
    saved.current = true;
    useHistoryStore.getState().addGame(toGameSummary(view, final));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [final]);

  useEffect(() => {
    if (!final || celebrated.current) return;
    celebrated.current = true;
    const t = setTimeout(() => fireConfetti(), 400);
    return () => clearTimeout(t);
  }, [final]);

  if (!final) {
    return (
      <PhaseLayout title={<span className="text-display text-xl text-fg">Game over</span>}>
        <div className="grid place-items-center py-16 text-fg-faint">Tallying…</div>
      </PhaseLayout>
    );
  }

  const winners = final.standings.filter((s) => s.rank === 1);
  const winnerNames = joinNames(winners.map((w) => w.name));
  const tie = winners.length > 1;

  const dock = (
    <div className="flex flex-col gap-2">
      {isHost && (
        <Button fullWidth size="lg" onClick={() => send({ type: "playAgain" })}>
          <RotateCcw size={20} aria-hidden /> Play again
        </Button>
      )}
      <div className="flex gap-2">
        <ResultCard view={view} final={final} variant="secondary" size="md" className="flex-1" />
        <Link
          href="/play"
          className="no-tap-highlight inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-(--radius-card) border border-line bg-surface-2 text-base text-fg shadow-soft"
        >
          <Home size={18} aria-hidden /> Home
        </Link>
      </div>
      {!isHost && (
        <p className="text-center text-sm text-fg-faint">
          Waiting for host to start another round…
        </p>
      )}
    </div>
  );

  return (
    <PhaseLayout title={<span className="text-display text-xl text-fg">Game over</span>} dock={dock}>
      <div className="flex flex-col gap-6">
        {isAuthEnabledClient && <ClaimSeat />}

        <header className="flex flex-col items-center gap-1 pt-2 text-center">
          <h1 className="text-serif text-4xl leading-tight text-fg">
            <span className="text-accent">{winnerNames}</span> {tie ? "tie" : "wins"}
          </h1>
        </header>

        <Podium standings={final.standings} />
        <Awards awards={final.awards} lookup={lookup} />
        <Standings standings={final.standings} youId={view.you} />
      </div>
    </PhaseLayout>
  );
}
