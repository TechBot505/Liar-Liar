"use client";

import type { JSX, ReactNode } from "react";

/** Shared horizontal rhythm: gutters + centered column, applied to every band. */
const BAND = "mx-auto w-full max-w-[480px] px-4 sm:px-5";

export interface PhaseLayoutProps {
  /** Sticker/title shown in its own row directly below RoomHeader. */
  title: ReactNode;
  /** Optional timer ring, right-aligned in the title row. */
  timer?: ReactNode;
  /** Optional full prompt, wrapped (max 3 lines) beneath the title. */
  prompt?: string;
  /** Always-visible bottom action dock (safe-area aware). */
  dock?: ReactNode;
  /** Compact reaction control, docked to the right of the dock row. */
  reaction?: ReactNode;
  /** Extra bottom padding (px) for content, e.g. answering's floating input. */
  contentPadBottom?: number;
  children: ReactNode;
}

/**
 * Shared room-phase shell used by every phase for a single consistent layout:
 *
 *   RoomHeader (owned by RoomScreen)
 *   ├─ title / timer row  ← sits BELOW the header, never overlaps its buttons
 *   ├─ scrollable content (flex-1, min-h-0, overflow-y-auto)
 *   └─ bottom action dock (sticky, safe-area) ← primary action ALWAYS visible
 *
 * Each band shares one horizontal rhythm (px-4, px-5 from sm, centered max-w
 * column) so cards, stickers, prompt and the dock button never touch the
 * screen edges. `safe-x` lives on the full-width outer wrappers so notch insets
 * add to — rather than clobber — the gutters.
 */
export function PhaseLayout({
  title,
  timer,
  prompt,
  dock,
  reaction,
  contentPadBottom,
  children,
}: PhaseLayoutProps): JSX.Element {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="safe-x shrink-0">
        <div className={`${BAND} flex items-start justify-between gap-3 pb-1 pt-1`}>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex min-w-0">{title}</div>
            {prompt && (
              <p className="line-clamp-3 text-xs leading-snug text-fg-muted">{prompt}</p>
            )}
          </div>
          {timer && <div className="shrink-0">{timer}</div>}
        </div>
      </div>

      <div className="no-scrollbar safe-x min-h-0 flex-1 overflow-y-auto">
        <div className={`${BAND} pt-1`} style={{ paddingBottom: contentPadBottom ?? 16 }}>
          {children}
        </div>
      </div>

      {(dock || reaction) && (
        <div
          className="safe-x shrink-0 border-t border-line bg-bg/85 backdrop-blur"
          style={{ paddingTop: 12, paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
        >
          <div className={`${BAND} flex items-center gap-2`}>
            {dock ? <div className="min-w-0 flex-1">{dock}</div> : <div className="flex-1" />}
            {reaction && <div className="shrink-0">{reaction}</div>}
          </div>
        </div>
      )}
    </section>
  );
}
