"use client";

import type { JSX } from "react";
import { Card, Divider, Segmented, Toggle } from "@/components/ui";
import type { Settings } from "@/game/types";

export interface GameSettingsFormProps {
  settings: Settings;
  onChange: (next: Settings) => void;
}

const ROUND_OPTS = [5, 7, 10].map((v) => ({ value: v, label: String(v) }));
const ANSWER_OPTS = [30, 45, 60, 90].map((v) => ({ value: v, label: `${v}s` }));
const VOTE_OPTS = [20, 30, 45].map((v) => ({ value: v, label: `${v}s` }));

function Row({ label, children }: { label: string; children: JSX.Element }): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-fg-faint">{label}</span>
      {children}
    </div>
  );
}

/** All host-tunable game settings (deck is chosen separately). */
export function GameSettingsForm({ settings, onChange }: GameSettingsFormProps): JSX.Element {
  const patch = (p: Partial<Settings>) => onChange({ ...settings, ...p });
  return (
    <Card padding="md" className="flex flex-col gap-4">
      <Row label="Rounds">
        <Segmented
          options={ROUND_OPTS}
          value={settings.rounds}
          onChange={(v) => patch({ rounds: v as Settings["rounds"] })}
          label="Rounds"
        />
      </Row>
      <Row label="Answer timer">
        <Segmented
          options={ANSWER_OPTS}
          value={settings.answerSeconds}
          onChange={(v) => patch({ answerSeconds: v as Settings["answerSeconds"] })}
          label="Answer timer"
        />
      </Row>
      <Row label="Vote timer">
        <Segmented
          options={VOTE_OPTS}
          value={settings.voteSeconds}
          onChange={(v) => patch({ voteSeconds: v as Settings["voteSeconds"] })}
          label="Vote timer"
        />
      </Row>
      <Divider />
      <div className="flex items-center justify-between">
        <span className="text-sm text-fg">Double points in final round</span>
        <Toggle
          checked={settings.doubleFinal}
          onChange={(v) => patch({ doubleFinal: v })}
          label="Double points in final round"
          hideLabel
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-fg">Family-friendly</span>
        <Toggle
          checked={settings.familyMode}
          onChange={(v) => patch({ familyMode: v })}
          label="Family-friendly"
          hideLabel
        />
      </div>
    </Card>
  );
}
