"use client";

import { useEffect, type JSX, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";

export type ModalTone = "truth" | "fooled" | "neutral";

export interface ModalCardProps {
  open: boolean;
  /** Optional — omit for a modal dismissed only by an inner action. */
  onClose?: () => void;
  children: ReactNode;
  /** Colors the top accent bar: truth = mint, fooled = coral, neutral = none. */
  tone?: ModalTone;
  className?: string;
}

const TONE_BAR: Record<ModalTone, string> = {
  truth: "bg-truth",
  fooled: "bg-accent",
  neutral: "bg-line",
};

/** Centered overlay card with a scale-in — used for per-player verdict popups. */
export function ModalCard({
  open,
  onClose,
  children,
  tone = "neutral",
  className,
}: ModalCardProps): JSX.Element {
  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
          <motion.div
            className="absolute inset-0 bg-bg/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className={cn(
              "relative z-10 w-full max-w-sm overflow-hidden rounded-(--radius-card) border border-line bg-surface shadow-soft",
              className,
            )}
          >
            <span className={cn("block h-1 w-full", TONE_BAR[tone])} aria-hidden />
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
