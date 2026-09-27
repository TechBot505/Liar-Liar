import type { JSX } from "react";
import type { ArtProps } from "../artProps";
import { CORAL } from "../artProps";

/** headlines — newspaper columns of text scrolling up under a blinking BREAKING bar. */
export function HeadlinesArt({ tint, tint2, uid }: ArtProps): JSX.Element {
  const cols = [8, 46, 84];
  // One column's worth of text lines, duplicated so the -50% scroll loops seamlessly.
  const lines = Array.from({ length: 7 }, (_, i) => i);
  return (
    <svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <clipPath id={`${uid}-clip`}>
          <rect x="0" y="18" width="120" height="62" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid}-clip)`}>
        {cols.map((cx, c) => (
          <g
            key={c}
            className="dart"
            style={{ animation: "dart-scroll-y 9s linear infinite", animationDelay: `${-c * 1.6}s` }}
          >
            {[0, 1].map((rep) =>
              lines.map((i) => (
                <rect
                  key={`${rep}-${i}`}
                  x={cx}
                  y={20 + rep * 63 + i * 9}
                  width={i % 3 === 0 ? 20 : 28}
                  height="3"
                  rx="1.5"
                  fill={tint}
                  fillOpacity={0.65}
                />
              )),
            )}
          </g>
        ))}
      </g>
      {/* masthead + blinking BREAKING banner */}
      <rect x="0" y="0" width="120" height="16" fill={tint2} fillOpacity="0.85" />
      <rect
        x="6"
        y="4"
        width="52"
        height="8"
        rx="1.5"
        fill={CORAL}
        className="dart"
        style={{ animation: "dart-twinkle 1.3s steps(1) infinite" }}
      />
      <rect x="64" y="5" width="34" height="2.4" rx="1.2" fill={tint} fillOpacity="0.8" />
      <rect x="64" y="9.5" width="24" height="2.4" rx="1.2" fill={tint} fillOpacity="0.6" />
    </svg>
  );
}
