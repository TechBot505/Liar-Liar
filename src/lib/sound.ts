import { getPrefs } from "@/lib/store/prefs";

/**
 * Tiny WebAudio synth — no asset files. The AudioContext is created lazily on
 * the first user gesture (browser autoplay policy) and every cue respects the
 * user's `sound` preference. All methods are no-ops during SSR.
 */
export type SoundName =
  | "tap"
  | "submit"
  | "tick"
  | "reveal"
  | "fooled"
  | "correct"
  | "win";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Call once inside a click/tap handler to unlock audio on iOS/Safari. */
export function primeAudio(): void {
  audio();
}

interface Blip {
  freq: number;
  dur: number;
  type?: OscillatorType;
  /** Start offset in seconds, for simple sequences. */
  at?: number;
  /** Target freq for a glide (womp/whoosh). */
  to?: number;
  gain?: number;
}

function play(blips: Blip[]): void {
  if (!getPrefs().sound) return;
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  for (const b of blips) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const start = now + (b.at ?? 0);
    const peak = b.gain ?? 0.12;
    osc.type = b.type ?? "sine";
    osc.frequency.setValueAtTime(b.freq, start);
    if (b.to) osc.frequency.exponentialRampToValueAtTime(b.to, start + b.dur);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + b.dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(start);
    osc.stop(start + b.dur + 0.02);
  }
}

const RECIPES: Record<SoundName, Blip[]> = {
  tap: [{ freq: 420, dur: 0.06, type: "triangle", gain: 0.08 }],
  submit: [
    { freq: 520, dur: 0.09, type: "triangle" },
    { freq: 780, dur: 0.12, type: "triangle", at: 0.08 },
  ],
  tick: [{ freq: 900, dur: 0.04, type: "square", gain: 0.05 }],
  reveal: [
    { freq: 300, dur: 0.14, type: "sawtooth", to: 620 },
    { freq: 680, dur: 0.16, type: "triangle", at: 0.12 },
  ],
  fooled: [{ freq: 380, dur: 0.4, type: "sawtooth", to: 120, gain: 0.14 }],
  correct: [
    { freq: 660, dur: 0.1, type: "triangle" },
    { freq: 990, dur: 0.16, type: "triangle", at: 0.09 },
  ],
  win: [
    { freq: 523, dur: 0.16, type: "triangle" },
    { freq: 659, dur: 0.16, type: "triangle", at: 0.14 },
    { freq: 784, dur: 0.16, type: "triangle", at: 0.28 },
    { freq: 1046, dur: 0.34, type: "triangle", at: 0.42, gain: 0.16 },
  ],
};

/** Play a named cue (respects the sound pref; safe to call anywhere). */
export function playSound(name: SoundName): void {
  play(RECIPES[name]);
}
