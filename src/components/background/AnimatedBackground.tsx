import type { JSX } from "react";

/**
 * Static, calm backdrop: the solid near-black canvas (from <body>) plus one
 * very subtle coral spotlight from top-center and a faint noise layer. No
 * animation — a single fixed, non-interactive layer behind all content.
 */
export function AnimatedBackground(): JSX.Element {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg" aria-hidden>
      {/* Single-hue spotlight/vignette from top center, accent at ~6% opacity. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 42% at 50% -8%, rgba(255,90,78,0.06), transparent 70%)",
        }}
      />
      <div className="grain absolute inset-0" />
    </div>
  );
}
