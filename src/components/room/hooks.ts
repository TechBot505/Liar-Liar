"use client";

import { useEffect, useRef, useState } from "react";
import { playSound, type SoundName } from "@/lib/sound";
import { haptic } from "@/lib/haptics";
import type { Phase } from "@/game/types";

/** Bottom inset (px) so inputs stay above the on-screen keyboard (visualViewport). */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return;
    const onResize = () => {
      const gap = window.innerHeight - vv.height - vv.offsetTop;
      setInset(Math.max(0, Math.round(gap)));
    };
    onResize();
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, []);
  return inset;
}

const PHASE_SOUND: Partial<Record<Phase, SoundName>> = {
  answering: "reveal",
  voting: "submit",
  reveal: "reveal",
  scores: "correct",
  final: "win",
};

/** Play a cue + haptic on every phase change (skips the very first render). */
export function usePhaseEffects(phase: Phase): void {
  const prev = useRef<Phase | null>(null);
  useEffect(() => {
    if (prev.current !== null && prev.current !== phase) {
      const s = PHASE_SOUND[phase];
      if (s) playSound(s);
      haptic("success");
    }
    prev.current = phase;
  }, [phase]);
}

/** Tick sound + haptic during each of the final 5 seconds of a live timer. */
export function useTimerTicks(
  deadline: number | undefined,
  serverOffset: number,
  active: boolean,
): void {
  const lastSec = useRef(-1);
  useEffect(() => {
    if (!active || !deadline) return;
    const iv = setInterval(() => {
      const remain = Math.ceil((deadline - (Date.now() + serverOffset)) / 1000);
      if (remain <= 5 && remain >= 1 && remain !== lastSec.current) {
        lastSec.current = remain;
        playSound("tick");
        haptic("warn");
      }
      if (remain > 5) lastSec.current = -1;
    }, 200);
    return () => clearInterval(iv);
  }, [deadline, serverOffset, active]);
}

/** True when the device has a fine pointer (desktop) — used to gate autoFocus. */
export function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    setDesktop(window.matchMedia?.("(pointer: fine)").matches ?? false);
  }, []);
  return desktop;
}

/** Whole seconds remaining until a server-epoch `deadline` (0 when passed). */
export function useDeadlineCountdown(deadline: number | undefined, serverOffset: number): number {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!deadline) {
      setSecs(0);
      return;
    }
    const tick = () =>
      setSecs(Math.max(0, Math.ceil((deadline - (Date.now() + serverOffset)) / 1000)));
    tick();
    const iv = setInterval(tick, 250);
    return () => clearInterval(iv);
  }, [deadline, serverOffset]);
  return secs;
}
