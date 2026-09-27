import type { Variants } from "motion/react";

/**
 * Shared motion presets for the home flow. All springy + playful. Callers pair
 * these with `useReducedMotion()` from motion/react so we skip transforms for
 * users who ask for reduced motion (Framer/Motion also damps globally via CSS).
 */

/** Page-level container that staggers its children in on mount. */
export const pageStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

/** A single item that springs up + fades in. */
export const springUp: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 480, damping: 30 },
  },
};

/** Sideways entrance used for horizontally-arranged sticker cards. */
export const springIn: Variants = {
  hidden: { opacity: 0, y: 16, rotate: -4 },
  show: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring", stiffness: 420, damping: 26 },
  },
};

/** Whole-page entrance wrapper props (springy fade). */
export const pageEnter = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring", stiffness: 260, damping: 30 } as const,
};
