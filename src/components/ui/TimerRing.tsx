"use client";

import { useEffect, useRef, useState, type JSX } from "react";
import { cn } from "@/lib/cn";

export interface TimerRingProps {
  /** Server epoch-ms deadline. */
  deadline: number;
  /** Total duration in seconds (for the ring fraction). */
  total: number;
  /** Client→server clock offset (ms) from useRoom. */
  serverOffset?: number;
  size?: number;
  className?: string;
}

const R = 47;
const CIRC = 2 * Math.PI * R;

/** Thin countdown ring: mono seconds, turns accent under 10s. No pulsing. */
export function TimerRing({ deadline, total, serverOffset = 0, size = 96, className }: TimerRingProps): JSX.Element {
  const [remaining, setRemaining] = useState(() => remainingMs(deadline, serverOffset));
  const announcedRef = useRef(false);

  useEffect(() => {
    const tick = () => setRemaining(remainingMs(deadline, serverOffset));
    tick();
    const iv = setInterval(tick, 200);
    return () => clearInterval(iv);
  }, [deadline, serverOffset]);

  const secs = Math.max(0, Math.ceil(remaining / 1000));
  const frac = total > 0 ? Math.max(0, Math.min(1, remaining / (total * 1000))) : 0;
  const urgent = secs <= 10;
  if (secs <= 10) announcedRef.current = true;

  return (
    <div className={cn("relative inline-grid place-items-center", className)}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
        <circle cx={50} cy={50} r={R} fill="none" stroke="var(--color-line)" strokeWidth={2} />
        <circle
          cx={50}
          cy={50}
          r={R}
          fill="none"
          stroke={urgent ? "var(--color-accent)" : "var(--color-fg-muted)"}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - frac)}
          style={{ transition: "stroke-dashoffset 0.2s linear, stroke 0.3s ease" }}
        />
      </svg>
      <span
        className={cn(
          "text-mono absolute text-2xl font-medium tabular-nums",
          urgent ? "text-accent" : "text-fg",
        )}
      >
        {secs}
      </span>
      <span className="sr-only" aria-live="assertive">
        {urgent && secs > 0 ? `${secs} seconds left` : ""}
      </span>
    </div>
  );
}

function remainingMs(deadline: number, offset: number): number {
  return deadline - (Date.now() + offset);
}
