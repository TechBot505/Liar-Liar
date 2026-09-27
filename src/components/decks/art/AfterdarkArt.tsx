import type { JSX } from "react";
import type { ArtProps } from "../artProps";
import { CORAL } from "../artProps";

/** afterdark — a hushed starfield with a slim crescent moon, slow twinkle. */
export function AfterdarkArt({ tint, tint2, uid }: ArtProps): JSX.Element {
  const stars = Array.from({ length: 16 }, (_, i) => ({
    x: (i * 37) % 118 + 1,
    y: (i * 53) % 74 + 3,
    r: 0.6 + (i % 3) * 0.5,
    d: `${-(i % 6) * 0.9}s`,
  }));
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={tint} stopOpacity="0.35" />
          <stop offset="100%" stopColor={tint2} stopOpacity="0" />
        </radialGradient>
        <mask id={`${uid}-crescent`}>
          <circle cx="86" cy="26" r="12" fill="#fff" />
          <circle cx="91" cy="23" r="11" fill="#000" />
        </mask>
      </defs>
      <rect x="0" y="0" width="120" height="80" fill={`url(#${uid}-glow)`} />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={i % 5 === 0 ? CORAL : tint} className="dart" style={{ animation: "dart-twinkle 4.5s ease-in-out infinite", animationDelay: s.d }} />
      ))}
      <circle cx="86" cy="26" r="12" fill={tint} fillOpacity="0.9" mask={`url(#${uid}-crescent)`} />
    </svg>
  );
}
