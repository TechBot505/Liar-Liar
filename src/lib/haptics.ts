import { getPrefs } from "@/lib/store/prefs";

/**
 * Haptic feedback via the Vibration API. iOS Safari does not support
 * navigator.vibrate, so these silently no-op there — never throws, never
 * blocks. Respects the user's `haptics` preference.
 */
export type HapticName = "tap" | "select" | "submit" | "success" | "error" | "warn";

const PATTERNS: Record<HapticName, number | number[]> = {
  tap: 8,
  select: 12,
  submit: [10, 30, 10],
  success: [12, 40, 24],
  error: [40, 60, 40],
  warn: [20, 40, 20],
};

function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

/** Fire a named haptic pattern (no-op when unsupported or disabled). */
export function haptic(name: HapticName): void {
  if (!getPrefs().haptics || !canVibrate()) return;
  try {
    navigator.vibrate(PATTERNS[name]);
  } catch {
    // Some engines throw on rapid calls; ignore — haptics are best-effort.
  }
}
