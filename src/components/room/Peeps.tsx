"use client";

import type { JSX } from "react";
import { AvatarStack } from "@/components/ui";
import { normalizeAvatar } from "@/lib/avatar";
import { joinNames, namesOf, type PlayerLookup } from "./util";

export interface PeepsProps {
  ids: string[];
  lookup: PlayerLookup;
  size?: number;
  /** Fallback text when there are no ids (e.g. "nobody"). */
  empty?: string;
  className?: string;
}

/** Inline "avatars + joined names" — the shared credit chip for who did what. */
export function Peeps({ ids, lookup, size = 22, empty, className }: PeepsProps): JSX.Element | null {
  const players = ids
    .map((id) => lookup(id))
    .filter((p) => p !== undefined)
    .map((p) => ({ id: p.id, avatar: normalizeAvatar(p.avatar), name: p.name }));

  if (players.length === 0) {
    return empty ? <span className={className}>{empty}</span> : null;
  }
  return (
    <span className={`inline-flex min-w-0 items-center gap-2 ${className ?? ""}`}>
      <AvatarStack players={players} size={size} max={4} />
      <span className="min-w-0 truncate text-fg">{joinNames(namesOf(ids, lookup))}</span>
    </span>
  );
}
