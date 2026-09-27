"use client";

import { useEffect, useState, type JSX } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ProgressDots } from "@/components/ui";

export interface RoundIntroProps {
  /** Stable per-round key so the intro plays at most once per round. */
  roundKey: string;
  index: number;
  total: number;
  deckName: string;
  /** ms elapsed since the answering phase began (skip intro on late reconnect). */
  elapsedMs: number;
  onDone: () => void;
}

/** Rounds whose intro has already played this session (survives remounts). */
const played = new Set<string>();
const INTRO_MS = 1600;

/**
 * Full-screen calm intro: "Round N of M", progress dots, deck name, and a
 * final-round note. Auto-dismisses after ~1.6s, skippable by tap, and skipped
 * entirely on reconnect (>5s elapsed) or if it already played this round.
 */
export function RoundIntro({
  roundKey, index, total, deckName, elapsedMs, onDone,
}: RoundIntroProps): JSX.Element | null {
  const reduce = useReducedMotion();
  const skip = played.has(roundKey) || elapsedMs > 5000 || reduce;
  const [show, setShow] = useState(!skip);

  useEffect(() => {
    if (skip) {
      onDone();
      return;
    }
    played.add(roundKey);
    const t = setTimeout(() => {
      setShow(false);
      onDone();
    }, INTRO_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundKey]);

  const dismiss = () => {
    if (!show) return;
    setShow(false);
    onDone();
  };
  const isFinal = index === total - 1;

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label="Skip round intro"
          onClick={dismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="glass no-tap-highlight fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 px-8 text-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-mono text-sm uppercase tracking-[0.2em] text-fg-muted"
          >
            Round {index + 1} of {total}
          </motion.span>
          <ProgressDots total={total} current={index} label={`Round ${index + 1} of ${total}`} />
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="text-display text-3xl text-fg"
          >
            {deckName}
          </motion.span>
          {isFinal && (
            <span className="text-serif text-2xl text-accent">Final round · double points</span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
