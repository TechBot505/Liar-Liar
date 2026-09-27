import type { JSX } from "react";
import type { ArtProps } from "../artProps";
import { CORAL } from "../artProps";

/** laws — a balance scale whose beam tilts back and forth beside a bobbing gavel. */
export function LawsArt({ tint, tint2 }: ArtProps): JSX.Element {
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      {/* scales: central post + tilting beam with two hanging pans */}
      <g stroke={tint} strokeWidth="1.4" fill="none" strokeLinecap="round">
        <line x1="40" y1="20" x2="40" y2="60" />
        <line x1="30" y1="62" x2="50" y2="62" />
        <g style={{ transformOrigin: "40px 22px", animation: "dart-tilt 7s ease-in-out infinite" }} className="dart">
          <line x1="22" y1="22" x2="58" y2="22" />
          <line x1="22" y1="22" x2="22" y2="34" />
          <line x1="58" y1="22" x2="58" y2="34" />
          <path d="M15 34 h14 l-7 8 z" fill={`${tint2}`} fillOpacity="0.7" />
          <path d="M51 34 h14 l-7 8 z" fill={`${tint2}`} fillOpacity="0.7" />
        </g>
      </g>
      {/* gavel: head + handle bobbing to strike */}
      <g
        style={{ transformOrigin: "92px 30px", animation: "dart-tilt 3.4s ease-in-out infinite" }}
        className="dart"
        stroke={CORAL}
        strokeWidth="2"
        strokeLinecap="round"
      >
        <rect x="80" y="24" width="20" height="12" rx="2.5" fill={CORAL} fillOpacity="0.85" stroke="none" />
        <line x1="90" y1="36" x2="98" y2="56" />
      </g>
      <line x1="82" y1="60" x2="106" y2="60" stroke={tint} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
