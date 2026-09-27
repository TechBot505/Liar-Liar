import type { JSX } from "react";
import type { ArtProps } from "../artProps";
import { CORAL } from "../artProps";

/** nasty — wobbling slime blobs with a slow undulating worm curve. */
export function NastyArt({ tint, tint2, uid }: ArtProps): JSX.Element {
  const blobs = [
    { cx: 30, cy: 30, r: 13, d: "0s" },
    { cx: 84, cy: 26, r: 10, d: "-1.3s" },
    { cx: 62, cy: 52, r: 15, d: "-0.7s" },
    { cx: 98, cy: 56, r: 8, d: "-2s" },
  ];
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={`${uid}-goo`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={tint} stopOpacity="0.85" />
          <stop offset="100%" stopColor={tint2} stopOpacity="0.4" />
        </radialGradient>
      </defs>
      {blobs.map((b, i) => (
        <circle
          key={i}
          cx={b.cx}
          cy={b.cy}
          r={b.r}
          fill={`url(#${uid}-goo)`}
          className="dart"
          style={{ transformOrigin: `${b.cx}px ${b.cy}px`, animation: "dart-wobble 4.2s ease-in-out infinite", animationDelay: b.d }}
        />
      ))}
      {/* undulating worm */}
      <path
        d="M6 64 q12 -12 24 0 t24 0 t24 0 t24 0"
        fill="none"
        stroke={CORAL}
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.7"
        className="dart"
        style={{ animation: "dart-float 5s ease-in-out infinite" }}
      />
    </svg>
  );
}
