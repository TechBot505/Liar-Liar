import type { JSX } from "react";
import type { ArtProps } from "../artProps";
import { CORAL } from "../artProps";

/** movies — a film strip with perforations and a slow light-leak sweep. */
export function MoviesArt({ tint, tint2, uid }: ArtProps): JSX.Element {
  const perfs = Array.from({ length: 7 }, (_, i) => 6 + i * 11);
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-leak`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={CORAL} stopOpacity="0" />
          <stop offset="50%" stopColor={CORAL} stopOpacity="0.5" />
          <stop offset="100%" stopColor={tint} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="10" width="120" height="60" fill={tint2} fillOpacity="0.2" />
      {[8, 108].map((x) => (
        <g key={x}>
          {perfs.map((y) => (
            <rect key={y} x={x - 2} y={y} width="6" height="6" rx="1.5" fill="none" stroke={tint} strokeWidth="1" strokeOpacity="0.6" />
          ))}
        </g>
      ))}
      {[28, 52].map((y) => (
        <rect key={y} x="22" y={y} width="76" height="16" rx="2" fill="none" stroke={tint} strokeWidth="1" strokeOpacity="0.3" />
      ))}
      <rect x="0" y="10" width="34" height="60" fill={`url(#${uid}-leak)`} className="dart" style={{ animation: "dart-sweep 9s ease-in-out infinite" }} />
    </svg>
  );
}
