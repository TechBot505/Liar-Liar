import type { JSX } from "react";
import type { ArtProps } from "../artProps";
import { CORAL } from "../artProps";

/** history — concentric timeline rings with tick marks and a slow sundial shadow. */
export function HistoryArt({ tint, tint2 }: ArtProps): JSX.Element {
  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <g transform="translate(60 40)">
        {[10, 20, 30].map((r) => (
          <circle key={r} r={r} fill="none" stroke={tint} strokeWidth="1" strokeOpacity={r === 20 ? 0.4 : 0.2} />
        ))}
        <g className="dart" style={{ animation: "dart-spin 22s linear infinite" }}>
          {ticks.map((deg) => (
            <line key={deg} x1="0" y1="-30" x2="0" y2="-26" transform={`rotate(${deg})`} stroke={tint} strokeWidth="1" strokeOpacity="0.5" />
          ))}
        </g>
        {/* sundial gnomon shadow */}
        <line x1="0" y1="0" x2="0" y2="-28" stroke={CORAL} strokeWidth="1.5" strokeOpacity="0.6" className="dart" style={{ animation: "dart-spin 44s linear infinite" }} />
        <circle r="2.5" fill={tint2} stroke={tint} strokeWidth="1" />
      </g>
    </svg>
  );
}
