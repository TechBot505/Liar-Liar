"use client";

import { useState, type JSX } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Smile, X } from "lucide-react";
import { REACTION_EMOJIS, type ClientMessage } from "@/game/protocol";
import { haptic } from "@/lib/haptics";

export interface ReactionBarProps {
  send: (msg: ClientMessage) => void;
}

/**
 * Compact reaction control that lives inside the bottom dock row (see
 * PhaseLayout), sitting to the right of the primary action so it never overlaps
 * scrollable list content. Collapsed it is a single round button; tapping opens
 * a vertical emoji cluster UPWARD from the dock, anchored to the button's right
 * edge so it clears the primary action. Broadcasts are rate-limited server-side.
 */
export function ReactionBar({ send }: ReactionBarProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  const react = (emoji: (typeof REACTION_EMOJIS)[number]) => {
    haptic("select");
    send({ type: "react", emoji });
    setOpen(false);
  };

  return (
    <div className="relative shrink-0">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 12 }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            className="glass absolute bottom-full right-0 z-30 mb-2 flex flex-col items-center gap-1 rounded-(--radius-card) px-1.5 py-2"
            role="group"
            aria-label="Send a reaction"
          >
            {REACTION_EMOJIS.map((emoji) => (
              <motion.button
                key={emoji}
                type="button"
                aria-label={`React ${emoji}`}
                whileTap={{ scale: 0.8 }}
                onClick={() => react(emoji)}
                className="no-tap-highlight flex size-11 items-center justify-center rounded-xl text-2xl"
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        aria-label={open ? "Close reactions" : "Open reactions"}
        aria-expanded={open}
        onClick={() => {
          haptic("tap");
          setOpen((o) => !o);
        }}
        style={{ borderRadius: 9999 }}
        className="no-tap-highlight flex size-11 items-center justify-center border border-line bg-surface-2 text-fg-muted shadow-soft"
      >
        {open ? <X size={20} aria-hidden /> : <Smile size={20} aria-hidden />}
      </button>
    </div>
  );
}
