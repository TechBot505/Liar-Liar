"use client";

import type { JSX } from "react";
import { Check } from "lucide-react";
import {
  ANSWER_OPTIONS,
  ROUND_OPTIONS,
  VOTE_OPTIONS,
  type Settings,
} from "@/game/types";
import { listDecks } from "@/decks/registry";
import { Segmented, Sheet, Toggle } from "@/components/ui";
import { cn } from "@/lib/cn";

export interface LobbySettingsSheetProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

const numOpts = <T extends number>(vals: readonly T[], suffix = "") =>
  vals.map((v) => ({ value: v, label: `${v}${suffix}` }));

/** Host-only sheet to change the deck and match settings (sends updateSettings). */
export function LobbySettingsSheet({
  open,
  onClose,
  settings,
  onChange,
}: LobbySettingsSheetProps): JSX.Element {
  return (
    <Sheet open={open} onClose={onClose} title="Game settings">
      <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pb-2">
        <div className="flex flex-col gap-2">
          <span className="px-1 text-sm text-fg-muted">Deck</span>
          <div className="grid grid-cols-2 gap-2">
            {listDecks().map((d) => {
              const active = d.id === settings.deckId;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onChange({ deckId: d.id })}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-2 rounded-(--radius-card) border bg-surface px-3 py-2 text-left shadow-soft",
                    active ? "border-accent" : "border-line",
                  )}
                >
                  <span className="text-xl" aria-hidden>
                    {d.emoji}
                  </span>
                  <span className="flex-1 truncate text-sm text-fg">
                    {d.name}
                  </span>
                  {active && <Check size={16} className="text-accent" aria-hidden />}
                </button>
              );
            })}
          </div>
        </div>

        <Setting label="Rounds">
          <Segmented
            label="Rounds"
            options={numOpts(ROUND_OPTIONS)}
            value={settings.rounds}
            onChange={(rounds) => onChange({ rounds })}
          />
        </Setting>
        <Setting label="Answer timer">
          <Segmented
            label="Answer seconds"
            options={numOpts(ANSWER_OPTIONS, "s")}
            value={settings.answerSeconds}
            onChange={(answerSeconds) => onChange({ answerSeconds })}
          />
        </Setting>
        <Setting label="Vote timer">
          <Segmented
            label="Vote seconds"
            options={numOpts(VOTE_OPTIONS, "s")}
            value={settings.voteSeconds}
            onChange={(voteSeconds) => onChange({ voteSeconds })}
          />
        </Setting>

        <div className="flex items-center justify-between">
          <Toggle
            label="Final round ×2"
            checked={settings.doubleFinal}
            onChange={(doubleFinal) => onChange({ doubleFinal })}
          />
          <Toggle
            label="Family mode"
            checked={settings.familyMode}
            onChange={(familyMode) => onChange({ familyMode })}
          />
        </div>
      </div>
    </Sheet>
  );
}

function Setting({ label, children }: { label: string; children: JSX.Element }): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <span className="px-1 text-sm text-fg-muted">{label}</span>
      {children}
    </div>
  );
}
