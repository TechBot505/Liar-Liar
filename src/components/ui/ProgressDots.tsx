import type { JSX } from "react";
import { cn } from "@/lib/cn";

export interface ProgressDotsProps {
  /** Total number of steps. */
  total: number;
  /** Zero-based index of the current step. */
  current: number;
  className?: string;
  /** Accessible label for the whole group. */
  label?: string;
}

/** Round step progress: filled (done), accent (current), faint (upcoming). */
export function ProgressDots({ total, current, className, label = "Progress" }: ProgressDotsProps): JSX.Element {
  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.max(0, total - 1)}
      aria-valuenow={current}
    >
      {Array.from({ length: total }, (_, i) => {
        const state = i === current ? "current" : i < current ? "done" : "upcoming";
        return (
          <span
            key={i}
            aria-hidden
            className={cn(
              "rounded-full transition-all",
              state === "current" && "size-2 bg-accent",
              state === "done" && "size-1.5 bg-fg-muted",
              state === "upcoming" && "size-1.5 bg-fg-faint/50",
            )}
          />
        );
      })}
    </div>
  );
}
