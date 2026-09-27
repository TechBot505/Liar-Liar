import type { JSX } from "react";
import type { ArtProps } from "../artProps";
import { CORAL } from "../artProps";

/** acronyms — a grid of monospace letter blocks gently rearranging. */
export function AcronymsArt({ tint, tint2 }: ArtProps): JSX.Element {
  const letters = ["F", "Y", "I", "A", "S", "A", "P", "T", "L", "D", "R", "K"];
  const cols = 4;
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      {letters.map((ch, i) => {
        const x = 16 + (i % cols) * 29;
        const y = 18 + Math.floor(i / cols) * 24;
        const hot = i === 5;
        return (
          <g key={i} className="dart" style={{ animation: "dart-float 6.5s ease-in-out infinite", animationDelay: `${-(i % 5) * 0.9}s` }}>
            <rect x={x - 9} y={y - 12} width="18" height="18" rx="3" fill={tint2} fillOpacity="0.25" stroke={hot ? CORAL : tint} strokeWidth="1" strokeOpacity="0.6" />
            <text x={x} y={y + 1} fill={hot ? CORAL : tint} textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize="11" fontWeight={600}>
              {ch}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
