import type { JSX } from "react";
import type { AvatarConfig } from "@/lib/avatar";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/avatar/Avatar";

export interface AvatarStackItem {
  id: string;
  avatar: AvatarConfig;
  name?: string;
}

export interface AvatarStackProps {
  players: AvatarStackItem[];
  size?: number;
  /** Cap shown avatars; the rest collapse into a "+N" chip. */
  max?: number;
  className?: string;
}

/** Overlapping row of avatars with a "+N" overflow chip. */
export function AvatarStack({ players, size = 40, max = 5, className }: AvatarStackProps): JSX.Element {
  const shown = players.slice(0, max);
  const overflow = players.length - shown.length;
  const overlap = Math.round(size * 0.35);

  return (
    <div className={cn("flex items-center", className)}>
      {shown.map((p, i) => (
        <div
          key={p.id}
          style={{ marginLeft: i === 0 ? 0 : -overlap, zIndex: shown.length - i }}
          className="rounded-full ring-2 ring-bg"
        >
          <Avatar config={p.avatar} size={size} title={p.name} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{ marginLeft: -overlap, width: size, height: size }}
          className="text-mono flex items-center justify-center rounded-full bg-surface-2 text-sm font-medium text-fg-muted ring-2 ring-bg"
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
