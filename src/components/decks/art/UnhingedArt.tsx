import type { JSX } from "react";
import type { ArtProps } from "../artProps";
import { CORAL } from "../artProps";

/** unhinged — a slowly rotating spiral with a jittering smiley at its center. */
export function UnhingedArt({ tint, tint2 }: ArtProps): JSX.Element {
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      {/* spiral */}
      <g style={{ transformOrigin: "60px 40px", animation: "dart-spin 16s linear infinite" }} className="dart">
        <path
          d="M60 40 m0 0 a4 4 0 1 1 -4 4 a9 9 0 1 0 9 -9 a15 15 0 1 1 -15 15 a22 22 0 1 0 22 -22 a28 28 0 1 1 -28 28"
          fill="none"
          stroke={tint}
          strokeWidth="1.6"
          strokeOpacity="0.7"
          strokeLinecap="round"
        />
      </g>
      {/* jittering smiley */}
      <g
        className="dart"
        style={{ transformOrigin: "60px 40px", animation: "dart-jitter 0.45s steps(2) infinite" }}
      >
        <circle cx="60" cy="40" r="12" fill={tint2} fillOpacity="0.7" stroke={CORAL} strokeWidth="1.6" />
        <circle cx="55.5" cy="37" r="1.8" fill={CORAL} />
        <circle cx="64.5" cy="37" r="1.8" fill={CORAL} />
        <path d="M54 43 q6 6 12 0" fill="none" stroke={CORAL} strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}
