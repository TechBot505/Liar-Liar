"use client";

import type { JSX } from "react";
import type { PlayerView } from "@/game/types";
import { Avatar } from "@/components/avatar/Avatar";
import { Card, Sticker } from "@/components/ui";
import { normalizeAvatar } from "@/lib/avatar";
import { cn } from "@/lib/cn";

export interface PromptCardProps {
  prompt: string;
  isPlayerKind: boolean;
  target?: PlayerView;
  /** You are the target: truth-telling styling instead of a lie hint. */
  truthMode?: boolean;
}

/** Centered question card; the `____` blank renders as an accent underline. */
export function PromptCard({ prompt, isPlayerKind, target, truthMode }: PromptCardProps): JSX.Element {
  const parts = prompt.split(/_{2,}/);
  return (
    <Card
      padding="lg"
      className={cn("flex flex-col items-center gap-3 text-center", truthMode && "border-truth/40")}
    >
      {isPlayerKind && target && (
        <div className="flex flex-col items-center gap-1">
          <Avatar config={normalizeAvatar(target.avatar)} size={56} ring mood="smug" />
          <span className="text-sm text-fg-muted">{target.name}</span>
        </div>
      )}
      <p className="text-display text-2xl leading-tight text-fg sm:text-[28px]">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="mx-1 inline-block w-14 border-b-2 border-accent align-middle" aria-hidden />
            )}
          </span>
        ))}
      </p>
      {truthMode && <Sticker tone="truth">Tell the truth</Sticker>}
    </Card>
  );
}
