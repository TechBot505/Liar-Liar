import type { JSX, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface StatProps {
  /** Small uppercase label above the number. */
  label: string;
  /** The big value — string or number, rendered in tabular mono. */
  value: ReactNode;
  prefix?: string;
  suffix?: string;
  /** Accent the number (e.g. a highlighted score). */
  accent?: boolean;
  className?: string;
}

/** Label + big tabular-mono number. Building block for scores / summaries. */
export function Stat({ label, value, prefix, suffix, accent, className }: StatProps): JSX.Element {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs font-medium uppercase tracking-wide text-fg-faint">{label}</span>
      <span
        className={cn(
          "text-mono text-3xl font-medium tabular-nums leading-none",
          accent ? "text-accent" : "text-fg",
        )}
      >
        {prefix}
        {value}
        {suffix}
      </span>
    </div>
  );
}
