import type { JSX } from "react";
import { cn } from "@/lib/cn";

export interface SpinnerProps {
  size?: number;
  className?: string;
  /** Accessible label; announced to screen readers. */
  label?: string;
}

/** Minimal accessible loading spinner using the ink/cream palette. */
export function Spinner({ size = 20, className, label = "Loading" }: SpinnerProps): JSX.Element {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-block animate-spin rounded-full border-[3px] border-current border-t-transparent", className)}
      style={{ width: size, height: size }}
    />
  );
}
