import type { JSX, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** New tones + backward-compatible aliases (candy names map to the new set). */
export type StickerTone =
  | "neutral"
  | "accent"
  | "truth"
  | "yellow"
  | "pink"
  | "cyan"
  | "lime"
  | "violet"
  | "red"
  | "cream";

const TONES: Record<StickerTone, string> = {
  neutral: "bg-surface-2 text-fg-muted border-line",
  accent: "bg-accent/12 text-accent border-accent/25",
  truth: "bg-truth/12 text-truth border-truth/25",
  // deprecated aliases
  yellow: "bg-accent/12 text-accent border-accent/25",
  pink: "bg-accent/12 text-accent border-accent/25",
  red: "bg-accent/12 text-accent border-accent/25",
  lime: "bg-truth/12 text-truth border-truth/25",
  cyan: "bg-surface-2 text-fg-muted border-line",
  violet: "bg-surface-2 text-fg-muted border-line",
  cream: "bg-surface-2 text-fg border-line",
};

export interface StickerProps {
  children: ReactNode;
  tone?: StickerTone;
  /** DEPRECATED: tilt is gone in the new system — accepted but ignored. */
  tilt?: boolean;
  className?: string;
}

/** Subtle pill chip — hairline border, quiet fill, tracked label. */
export function Sticker({ children, tone = "neutral", className }: StickerProps): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-(--radius-pill) border px-2.5 py-1 text-xs font-medium tracking-tight",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Alias — a small status pill. */
export { Sticker as Badge };
