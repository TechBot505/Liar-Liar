import type { JSX } from "react";
import type { AvatarConfig, EyesId, MouthId } from "@/lib/avatar";
import { cn } from "@/lib/cn";
import { FACE_PATHS } from "./parts/faces";
import { Eyes, Mouth } from "./parts/features";
import { Accessory } from "./parts/accessories";

const INK = "#0A0A0B";

export type AvatarMood = "idle" | "happy" | "sad" | "smug" | "shocked";

/** Mood overrides the configured eyes/mouth so the same avatar can emote. */
const MOOD: Record<AvatarMood, { eyes?: EyesId; mouth?: MouthId }> = {
  idle: {},
  happy: { eyes: "happy", mouth: "grin" },
  sad: { eyes: "sleepy", mouth: "frown" },
  smug: { eyes: "shifty", mouth: "smirk" },
  shocked: { eyes: "wide", mouth: "oh" },
};

export interface AvatarProps {
  config: AvatarConfig;
  /** Rendered pixel size (square). Default 96. */
  size?: number;
  /** Draw an accent ring (true = use body color, or pass a CSS color). */
  ring?: boolean | string;
  mood?: AvatarMood;
  /** Gentle idle bob (respects prefers-reduced-motion via CSS). */
  bob?: boolean;
  className?: string;
  title?: string;
}

/** Pure, dependency-light SVG avatar. Safe to render on the server. */
export function Avatar({
  config,
  size = 96,
  ring,
  mood = "idle",
  bob = false,
  className,
  title,
}: AvatarProps): JSX.Element {
  const override = MOOD[mood];
  const eyes = override.eyes ?? config.eyes;
  const mouth = override.mouth ?? config.mouth;
  const ringColor = ring === true ? config.color : ring || undefined;

  return (
    <svg
      viewBox="-10 -18 120 126"
      width={size}
      height={size}
      role="img"
      aria-label={title ?? "Player avatar"}
      className={cn("shrink-0 overflow-visible", className)}
    >
      {ringColor && (
        <circle cx={50} cy={54} r={57} fill="none" stroke={ringColor} strokeWidth={3} />
      )}
      <circle cx={50} cy={54} r={50} fill={config.bg} />
      <g className={bob ? "animate-bob" : undefined} style={{ transformOrigin: "50px 54px" }}>
        <path d={FACE_PATHS[config.face]} fill={config.color} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
        <Eyes id={eyes} />
        <Mouth id={mouth} />
        <Accessory id={config.accessory} />
      </g>
    </svg>
  );
}
