import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

/**
 * Type system for the minimal identity:
 * - Geist (sans): all UI. Clean, confident, tight tracking on large sizes.
 * - Geist Mono: room codes, timers, numbers (tabular).
 * - Instrument Serif (italic): rare expressive display — the word "Liar" in the
 *   logo and verdict headlines. Used sparingly.
 * Each exposes a CSS variable consumed by the @theme tokens in globals.css.
 */
export const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

/** All three font CSS-variable classes for the <html> element. */
export const fontVars = `${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`;
