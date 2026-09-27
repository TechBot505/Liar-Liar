"use client";

import type { JSX } from "react";
import { create } from "zustand";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";

export type ToastKind = "success" | "error" | "info" | "warn";

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastState {
  toasts: ToastItem[];
  push: (message: string, kind: ToastKind) => void;
  dismiss: (id: number) => void;
  clear: () => void;
}

let seq = 0;
const DURATION = 2500;

const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, kind) => {
    const id = ++seq;
    set({ toasts: [...get().toasts, { id, message, kind }] });
    setTimeout(() => get().dismiss(id), DURATION);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  clear: () => set({ toasts: [] }),
}));

/** Imperative API: `toast("Copied!", "success")`. Safe to call anywhere. */
export function toast(message: string, kind: ToastKind = "info"): void {
  useToastStore.getState().push(message, kind);
}

/** Dismiss every toast at once — call on game phase changes so stale toasts
 * (e.g. "Vote locked!") never bleed into the next phase. */
export function clearToasts(): void {
  useToastStore.getState().clear();
}

/** Small status dot color per kind — the only color the pill carries. */
const DOT: Record<ToastKind, string> = {
  success: "bg-truth",
  error: "bg-accent",
  info: "bg-fg-muted",
  warn: "bg-accent",
};

/** Mount once (in the root layout). Compact dark pills at top center. */
export function Toaster(): JSX.Element {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-3 pt-[max(12px,env(safe-area-inset-top))]"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            type="button"
            onClick={() => dismiss(t.id)}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className={cn(
              "glass pointer-events-auto flex max-w-sm items-center gap-2 rounded-(--radius-pill)",
              "px-4 py-2 text-sm font-medium tracking-tight text-fg shadow-soft",
            )}
          >
            <span className={cn("size-1.5 shrink-0 rounded-full", DOT[t.kind])} aria-hidden />
            {t.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
