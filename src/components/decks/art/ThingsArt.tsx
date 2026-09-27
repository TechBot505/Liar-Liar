import type { JSX } from "react";
import type { ArtProps } from "../artProps";
import { CORAL } from "../artProps";

/** things — small everyday-object line icons orbiting a central point
 *  (aglet, bottle cap, paperclip, dot, key). */
export function ThingsArt({ tint, tint2 }: ArtProps): JSX.Element {
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <g transform="translate(60 40)">
        <circle r="26" fill="none" stroke={tint2} strokeWidth="1" strokeOpacity="0.4" strokeDasharray="1 4" />
        <g className="dart" style={{ animation: "dart-spin 34s linear infinite" }} stroke={tint} strokeWidth="1.2" strokeOpacity="0.75" fill="none">
          {/* aglet */}
          <rect x="-3" y="-32" width="6" height="9" rx="2" />
          {/* bottle cap */}
          <g transform="translate(26 0)"><circle r="5" /><circle r="2" stroke={CORAL} /></g>
          {/* paperclip */}
          <path d="M-2 24 v6 a3 3 0 0 0 6 0 v-8 a3 3 0 0 0 -6 0" transform="translate(0 2)" />
          {/* key */}
          <g transform="translate(-26 0) rotate(90)"><circle r="3" /><line x1="0" y1="3" x2="0" y2="9" /><line x1="0" y1="7" x2="3" y2="7" /></g>
        </g>
        <circle r="2" fill={CORAL} fillOpacity="0.7" className="dart" style={{ animation: "dart-float 7s ease-in-out infinite" }} />
      </g>
    </svg>
  );
}
