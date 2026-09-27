import type { JSX } from "react";
import type { ArtProps } from "../artProps";
import { CORAL } from "../artProps";

/** spicy — a chili pepper bobbing upward under wavering lines of heat shimmer. */
export function SpicyArt({ tint, tint2, uid }: ArtProps): JSX.Element {
  const waves = [40, 58, 76];
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-pod`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CORAL} stopOpacity="0.95" />
          <stop offset="100%" stopColor={tint2} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {/* heat shimmer: wavy lines rising above the pepper */}
      {waves.map((x, i) => (
        <path
          key={i}
          d={`M${x} 30 q4 -6 0 -12 t0 -12`}
          fill="none"
          stroke={tint}
          strokeWidth="1.4"
          strokeOpacity="0.55"
          strokeLinecap="round"
          className="dart"
          style={{ transformOrigin: `${x}px 12px`, animation: "dart-jitter 1.1s ease-in-out infinite", animationDelay: `${-i * 0.35}s` }}
        />
      ))}
      {/* chili pepper bobbing up */}
      <g className="dart" style={{ animation: "dart-float 3.6s ease-in-out infinite" }}>
        <path
          d="M52 34 q10 -2 16 8 q8 16 -6 26 q-16 10 -22 -4 q-4 -10 4 -16 q6 -4 8 -14 z"
          fill={`url(#${uid}-pod)`}
        />
        <path d="M52 34 q-2 -8 6 -10" fill="none" stroke={tint} strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
