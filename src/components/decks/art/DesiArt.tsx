import type { JSX } from "react";
import type { ArtProps } from "../artProps";
import { CORAL } from "../artProps";

/** desi — an abstract rangoli-inspired radial mandala rotating slowly (respectful,
 *  geometric — no figurative or religious motifs). */
export function DesiArt({ tint, tint2 }: ArtProps): JSX.Element {
  const petals = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <g transform="translate(60 40)">
        <g className="dart" style={{ animation: "dart-spin 40s linear infinite" }}>
          {petals.map((deg) => (
            <g key={deg} transform={`rotate(${deg})`}>
              <path d="M0 -8 Q6 -22 0 -34 Q-6 -22 0 -8 Z" fill="none" stroke={tint} strokeWidth="1" strokeOpacity="0.55" />
              <circle cx="0" cy="-30" r="1.6" fill={deg % 60 === 0 ? CORAL : tint} fillOpacity="0.8" />
            </g>
          ))}
        </g>
        <g className="dart" style={{ animation: "dart-spin-rev 30s linear infinite" }}>
          <circle r="14" fill="none" stroke={tint2} strokeWidth="1" strokeOpacity="0.6" />
          <circle r="9" fill="none" stroke={tint} strokeWidth="1" strokeOpacity="0.4" strokeDasharray="2 3" />
        </g>
        <circle r="3" fill={CORAL} fillOpacity="0.7" />
      </g>
    </svg>
  );
}
