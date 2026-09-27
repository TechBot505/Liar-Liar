"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useRoom } from "@/lib/useRoom";
import { useHydrated } from "@/lib/store/hydrated";
import { useProfileStore } from "@/lib/store/profile";
import { useSeenStore } from "@/lib/store/seen";
import { Spinner, toast, clearToasts } from "@/components/ui";
import type { Phase } from "@/game/types";
import { friendlyError, type PhaseProps } from "./types";
import { usePhaseEffects } from "./hooks";
import { RoomHeader } from "./RoomHeader";
import { ConnectionBanner } from "./ConnectionBanner";
import { NoProfileGate } from "./NoProfileGate";
import { KickedScreen } from "./KickedScreen";
import { RoomError } from "./RoomError";
import { ReactionLayer } from "./ReactionLayer";
import { Lobby } from "./Lobby";
import { AnsweringPhase } from "./AnsweringPhase";
import { VotingPhase } from "./VotingPhase";
import { RevealPhase } from "./RevealPhase";
import { ScoresPhase } from "./ScoresPhase";
import { FinalPhase } from "./FinalPhase";

const ANNOUNCE: Record<Phase, string> = {
  lobby: "In the lobby",
  answering: "Answering — write your lie",
  voting: "Voting — find the truth",
  reveal: "The reveal",
  scores: "Scoreboard",
  final: "Final results",
};

/** Server error codes that just mean "you acted a beat too late" — the phase
 * already moved on. The UI already reflects the new state, so these are logged
 * rather than shown as scary error toasts. */
const BENIGN_ERROR_CODES = new Set<string>(["bad_phase", "not_active", "bad_option"]);

/** Top-level room controller: gates on profile, connects, and switches phases. */
export function RoomScreen({ code }: { code: string }): JSX.Element {
  const router = useRouter();
  const hydrated = useHydrated();
  const profile = useProfileStore((s) => s.profile);
  const addSeen = useSeenStore((s) => s.addSeen);
  const needsProfile = hydrated && (!profile || !profile.name);
  const ready = hydrated && !needsProfile;

  const { view, status, error, kicked, serverOffset, send, onReaction } = useRoom(ready ? code : null);
  const [specRound, setSpecRound] = useState<number | null>(null);
  const seenRef = useRef<number>(-1);

  usePhaseEffects(view?.phase ?? "lobby");

  // Clear any lingering toasts whenever the phase changes so stale messages
  // (e.g. "Vote locked!") never bleed into reveal/final.
  useEffect(() => {
    clearToasts();
  }, [view?.phase]);

  useEffect(() => {
    if (!error) return;
    // Benign phase-race codes: the client acted a beat after the phase moved on
    // (server codes from src/game/engine/handlers.ts). Log only — never toast.
    if (BENIGN_ERROR_CODES.has(error.code)) {
      if (error.code === "not_active") setSpecRound(view?.round?.index ?? null);
      console.debug("[room] benign phase-race error", error.code, error.message);
      return;
    }
    toast(friendlyError(error.code, error.message), "error");
  }, [error, view?.round?.index]);

  useEffect(() => {
    const r = view?.round;
    if (view?.phase === "reveal" && r?.result?.questionId && seenRef.current !== r.index) {
      seenRef.current = r.index;
      addSeen(r.result.deckId, [r.result.questionId]);
    }
  }, [view?.phase, view?.round, addSeen]);

  if (!hydrated) return <CenterSpinner />;
  if (needsProfile) return <NoProfileGate onReady={() => undefined} />;
  if (kicked) return <KickedScreen />;
  if (!view) {
    if (status === "closed") {
      return (
        <RoomError
          emoji="📡"
          title="Couldn't reach the room"
          message="We lost contact with the game server. Check your connection and try again."
        />
      );
    }
    return <CenterSpinner label="Joining room…" />;
  }

  const me = view.players.find((p) => p.id === view.you);
  const isHost = view.hostId === view.you;
  const spectating = view.round != null && specRound === view.round.index;
  const base: PhaseProps = { view, send, serverOffset, isHost, me };

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden">
      <RoomHeader
        code={view.code}
        onLeave={() => {
          send({ type: "leave" });
          router.push("/play");
        }}
      />
      <div className="shrink-0 px-[max(12px,env(safe-area-inset-left))]">
        <ConnectionBanner status={status} onRetry={() => window.location.reload()} />
      </div>
      <div aria-live="assertive" className="sr-only">
        {ANNOUNCE[view.phase]}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view.phase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="flex min-h-0 flex-1 flex-col"
        >
          {view.phase === "lobby" && <Lobby {...base} />}
          {view.phase === "answering" && <AnsweringPhase {...base} spectating={spectating} error={error} />}
          {view.phase === "voting" && <VotingPhase {...base} spectating={spectating} error={error} />}
          {view.phase === "reveal" && <RevealPhase {...base} />}
          {view.phase === "scores" && <ScoresPhase {...base} />}
          {view.phase === "final" && <FinalPhase {...base} />}
        </motion.div>
      </AnimatePresence>

      <ReactionLayer onReaction={onReaction} />
    </main>
  );
}

function CenterSpinner({ label }: { label?: string }): JSX.Element {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3">
      <Spinner size={32} />
      {label && <p className="text-sm text-fg-muted">{label}</p>}
    </div>
  );
}
