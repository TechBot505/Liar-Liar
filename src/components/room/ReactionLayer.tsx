"use client";

import { useEffect, useState, type JSX } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Reaction, ReactionListener } from "@/lib/useRoom";

interface Floater extends Reaction {
  key: number;
  x: number;
  drift: number;
}

export interface ReactionLayerProps {
  onReaction: (fn: ReactionListener) => () => void;
}

let seq = 0;

/** Floats incoming reaction emojis up from the bottom of the screen. */
export function ReactionLayer({ onReaction }: ReactionLayerProps): JSX.Element {
  const [floaters, setFloaters] = useState<Floater[]>([]);

  useEffect(() => {
    return onReaction((r) => {
      const f: Floater = { ...r, key: ++seq, x: 10 + Math.random() * 80, drift: Math.random() * 60 - 30 };
      setFloaters((prev) => [...prev.slice(-24), f]);
      setTimeout(() => {
        setFloaters((prev) => prev.filter((p) => p.key !== f.key));
      }, 2600);
    });
  }, [onReaction]);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      <AnimatePresence>
        {floaters.map((f) => (
          <motion.span
            key={f.key}
            initial={{ opacity: 0, scale: 0.4, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: 1, y: "-72vh", x: f.drift }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, ease: "easeOut" }}
            style={{ left: `${f.x}%`, bottom: "12%" }}
            className="absolute text-4xl"
          >
            {f.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
