"use client";

import { useEffect, useState, type JSX } from "react";
import { AnimatePresence, motion } from "motion/react";

const TIPS = [
  { emoji: "✍️", text: "Everyone gets the same prompt — write a convincing LIE." },
  { emoji: "🕵️", text: "Then hunt for the hidden TRUTH among all the lies." },
  { emoji: "😈", text: "Fool a friend? +1. Spot the truth? +2. Sneaky wins." },
  { emoji: "👑", text: "Most points after the final round takes the crown." },
];

/** Auto-advancing 'how to play' mini tips shown while waiting in the lobby. */
export function HowToTips(): JSX.Element {
  const [i, setI] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setI((n) => (n + 1) % TIPS.length), 3800);
    return () => clearInterval(iv);
  }, []);
  const tip = TIPS[i];

  return (
    <div className="flex min-h-[68px] items-center gap-3 rounded-(--radius-card) border border-line bg-surface px-4 py-3 shadow-soft">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3"
        >
          <span className="text-2xl" aria-hidden>
            {tip.emoji}
          </span>
          <p className="text-sm text-fg-muted">{tip.text}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
