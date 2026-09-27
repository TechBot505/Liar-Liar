import type { JSX } from "react";
import type { ArtProps } from "../artProps";
import { CORAL } from "../artProps";

/** truth — two overlapping masks/circles drifting in slow parallax; where they
 *  overlap the hidden truth shows through. */
export function TruthArt({ tint, tint2, uid }: ArtProps): JSX.Element {
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={`${uid}-a`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={tint} stopOpacity="0.55" />
          <stop offset="100%" stopColor={tint2} stopOpacity="0.05" />
        </radialGradient>
        <radialGradient id={`${uid}-b`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={CORAL} stopOpacity="0.4" />
          <stop offset="100%" stopColor={tint2} stopOpacity="0.05" />
        </radialGradient>
      </defs>
      <g style={{ mixBlendMode: "screen" }}>
        <circle cx="48" cy="40" r="30" fill={`url(#${uid}-a)`} className="dart" style={{ animation: "dart-parallax 11s ease-in-out infinite" }} />
        <circle cx="72" cy="40" r="30" fill={`url(#${uid}-b)`} className="dart" style={{ animation: "dart-parallax 11s ease-in-out infinite", animationDelay: "-5.5s" }} />
      </g>
      <circle cx="48" cy="40" r="30" fill="none" stroke={tint} strokeWidth="1" strokeOpacity="0.35" className="dart" style={{ animation: "dart-parallax 11s ease-in-out infinite" }} />
      <circle cx="72" cy="40" r="30" fill="none" stroke={CORAL} strokeWidth="1" strokeOpacity="0.3" className="dart" style={{ animation: "dart-parallax 11s ease-in-out infinite", animationDelay: "-5.5s" }} />
    </svg>
  );
}
