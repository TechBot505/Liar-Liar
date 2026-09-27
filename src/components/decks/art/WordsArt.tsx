import type { JSX } from "react";
import type { ArtProps } from "../artProps";
import { CORAL } from "../artProps";

/** words — dictionary ruled lines scrolling upward with drifting serif letterforms. */
export function WordsArt({ tint, tint2 }: ArtProps): JSX.Element {
  // Two stacked copies (0..80 and 80..160) so translateY(-50%) loops seamlessly.
  const rules = Array.from({ length: 16 }, (_, i) => 6 + i * 10);
  const letters = ["A", "b", "Q", "z", "M", "e"];
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <g className="dart" style={{ animation: "dart-scroll-y 18s linear infinite" }}>
        {rules.map((y) => (
          <line key={y} x1="10" y1={y} x2="110" y2={y} stroke={tint} strokeWidth="1" strokeOpacity={y % 20 === 6 ? 0.28 : 0.12} />
        ))}
        {letters.map((ch, i) => (
          <text
            key={ch}
            x={18 + (i % 3) * 40}
            y={22 + (i % 4) * 32}
            fill={i === 2 ? CORAL : tint2}
            fillOpacity="0.9"
            fontFamily="var(--font-serif), Georgia, serif"
            fontStyle="italic"
            fontSize="22"
          >
            {ch}
          </text>
        ))}
      </g>
    </svg>
  );
}
