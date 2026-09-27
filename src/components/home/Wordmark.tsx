import type { JSX } from "react";
import { cn } from "@/lib/cn";

export interface WordmarkProps {
  className?: string;
  /** Compact size for headers/top bars; default is the large hero size. */
  size?: "sm" | "lg";
}

/**
 * "Liar Liar" wordmark — the first word in Instrument Serif italic (the
 * expressive "liar" voice, in coral), the second in Geist semibold. Calm,
 * editorial, tasteful. No stickers, tilts, or wobble.
 */
export function Wordmark({ className, size = "lg" }: WordmarkProps): JSX.Element {
  const serif = size === "sm" ? "text-2xl" : "text-5xl sm:text-6xl";
  const sans = size === "sm" ? "text-xl" : "text-4xl sm:text-5xl";
  return (
    <div
      className={cn("flex items-baseline gap-1.5 leading-none", className)}
      aria-label="Liar Liar"
      role="img"
    >
      <span className={cn("text-serif text-accent", serif)} aria-hidden>
        Liar
      </span>
      <span className={cn("font-semibold tracking-[-0.03em] text-fg", sans)} aria-hidden>
        Liar
      </span>
    </div>
  );
}
