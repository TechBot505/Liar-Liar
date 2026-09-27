"use client";

import type { JSX } from "react";
import { AnimatePresence, motion } from "motion/react";
import { WifiOff } from "lucide-react";
import { Spinner } from "@/components/ui";
import type { RoomStatus } from "@/lib/useRoom";

export interface ConnectionBannerProps {
  status: RoomStatus;
  onRetry: () => void;
}

/** Slim top banner for reconnecting / lost-connection states with a retry. */
export function ConnectionBanner({ status, onRetry }: ConnectionBannerProps): JSX.Element {
  const show = status === "reconnecting" || status === "closed";
  const closed = status === "closed";
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="glass mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-(--radius-pill) px-4 py-2 text-sm text-fg"
        >
          {closed ? <WifiOff size={16} aria-hidden /> : <Spinner size={16} />}
          <span>{closed ? "Connection lost." : "Reconnecting…"}</span>
          {closed && (
            <button
              type="button"
              onClick={onRetry}
              className="ml-1 underline underline-offset-2"
            >
              Retry
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
