import type { JSX } from "react";
import type { ArtProps } from "../artProps";
import { CORAL } from "../artProps";

/** facts — a drifting grid of question marks slowly morphing to exclamations. */
export function FactsArt({ tint }: ArtProps): JSX.Element {
  const cols = 5;
  const rows = 3;
  const cells = Array.from({ length: cols * rows }, (_, i) => i);
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <g
        className="dart"
        style={{ animation: "dart-float 9s ease-in-out infinite" }}
        fontFamily="var(--font-mono), monospace"
        fontSize="13"
        fontWeight={600}
        textAnchor="middle"
      >
        {cells.map((i) => {
          const x = 14 + (i % cols) * 23;
          const y = 24 + Math.floor(i / cols) * 22;
          const delay = `${-(i % 6) * 1.1}s`;
          return (
            <g key={i} opacity={0.85}>
              <text x={x} y={y} fill={tint} className="dart" style={{ animation: "dart-morph 6.6s ease-in-out infinite", animationDelay: delay }}>
                ?
              </text>
              <text x={x} y={y} fill={CORAL} className="dart" style={{ animation: "dart-morph 6.6s ease-in-out infinite", animationDelay: `calc(${delay} - 3.3s)` }}>
                !
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
