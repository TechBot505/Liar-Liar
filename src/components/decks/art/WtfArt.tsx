import type { JSX } from "react";
import type { ArtProps } from "../artProps";
import { CORAL } from "../artProps";

/** wtf — two googly eyes whose pupils orbit, beside a glitching question mark. */
export function WtfArt({ tint, tint2 }: ArtProps): JSX.Element {
  const eyes = [
    { cx: 34, cy: 34 },
    { cx: 62, cy: 34 },
  ];
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      {eyes.map((e, i) => (
        <g key={i}>
          <circle cx={e.cx} cy={e.cy} r="14" fill={tint2} fillOpacity="0.55" stroke={tint} strokeWidth="1.4" />
          {/* pupil orbits around the eye center */}
          <g
            className="dart"
            style={{ transformOrigin: `${e.cx}px ${e.cy}px`, animation: "dart-spin 4s linear infinite", animationDelay: `${-i * 1}s` }}
          >
            <circle cx={e.cx} cy={e.cy - 6} r="4.5" fill={tint} />
          </g>
        </g>
      ))}
      {/* glitching question mark: a coral ghost jitters behind the tint glyph */}
      <text
        x="96"
        y="52"
        fontFamily="var(--font-mono), monospace"
        fontSize="42"
        fontWeight={700}
        textAnchor="middle"
        fill={CORAL}
        fillOpacity="0.6"
        className="dart"
        style={{ transformOrigin: "96px 40px", animation: "dart-jitter 0.5s steps(2) infinite" }}
      >
        ?
      </text>
      <text
        x="96"
        y="52"
        fontFamily="var(--font-mono), monospace"
        fontSize="42"
        fontWeight={700}
        textAnchor="middle"
        fill={tint}
        className="dart"
        style={{ animation: "dart-twinkle 2.6s ease-in-out infinite" }}
      >
        ?
      </text>
    </svg>
  );
}
