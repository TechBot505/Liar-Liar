"use client";

import { useEffect, useRef, useState, type JSX } from "react";

export interface CountUpProps {
  value: number;
  /** Animation duration in ms. */
  duration?: number;
  className?: string;
  /** Optional prefix/suffix (e.g. "+", " pts"). */
  prefix?: string;
  suffix?: string;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Tweens the displayed number from its previous value to `value`. */
export function CountUp({ value, duration = 700, className, prefix = "", suffix = "" }: CountUpProps): JSX.Element {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    fromRef.current = value;
    if (from === value || reduced()) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(from + (value - from) * easeOut(t)));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span className={className} aria-label={`${prefix}${value}${suffix}`}>
      {prefix}
      <span className="tabular-nums">{display}</span>
      {suffix}
    </span>
  );
}
