import type { JSX } from "react";
import { cn } from "@/lib/cn";

export interface DividerProps {
  /** Optional centered label (horizontal only). */
  label?: string;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/** Hairline separator. With a label it becomes a centered "— label —" rule. */
export function Divider({ label, orientation = "horizontal", className }: DividerProps): JSX.Element {
  if (orientation === "vertical") {
    return <span role="separator" aria-orientation="vertical" className={cn("w-px self-stretch bg-line", className)} />;
  }
  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)} role="separator" aria-label={label}>
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium uppercase tracking-wide text-fg-faint">{label}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
    );
  }
  return <hr className={cn("h-px border-0 bg-line", className)} />;
}
