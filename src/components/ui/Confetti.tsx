"use client";

import confetti from "canvas-confetti";

/** Restrained palette: coral accent + white + mint truth. No rainbows. */
const PALETTE = ["#FF5A4E", "#F5F5F4", "#4ADE80"];

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Tasteful burst. No-ops under prefers-reduced-motion. */
export function fireConfetti(options?: confetti.Options): void {
  if (reducedMotion() || typeof window === "undefined") return;
  confetti({
    particleCount: 60,
    spread: 60,
    startVelocity: 38,
    gravity: 1,
    scalar: 0.9,
    ticks: 160,
    origin: { y: 0.6 },
    colors: PALETTE,
    disableForReducedMotion: true,
    ...options,
  });
}

/** Podium celebration: a couple of restrained staggered bursts. */
export function firePodium(): void {
  if (reducedMotion() || typeof window === "undefined") return;
  const shots = [
    { x: 0.3, angle: 70 },
    { x: 0.7, angle: 110 },
  ];
  shots.forEach((s, i) =>
    setTimeout(
      () =>
        fireConfetti({
          particleCount: 45,
          angle: s.angle,
          spread: 55,
          origin: { x: s.x, y: 0.65 },
        }),
      i * 160,
    ),
  );
}
