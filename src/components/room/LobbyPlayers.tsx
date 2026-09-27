"use client";

import { useState, type JSX } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Crown } from "lucide-react";
import type { PlayerView } from "@/game/types";
import { Avatar } from "@/components/avatar/Avatar";
import { Button, Sheet } from "@/components/ui";
import { normalizeAvatar } from "@/lib/avatar";
import { cn } from "@/lib/cn";

export interface LobbyPlayersProps {
  players: PlayerView[];
  youId: string;
  isHost: boolean;
  onKick: (playerId: string) => void;
}

/** Lobby player grid: avatars pop in (spring), host crown, "you" tag, kick menu. */
export function LobbyPlayers({ players, youId, isHost, onKick }: LobbyPlayersProps): JSX.Element {
  const [target, setTarget] = useState<PlayerView | null>(null);

  return (
    <section aria-label="Players in the room">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        <AnimatePresence>
          {players.map((p) => {
            const you = p.id === youId;
            const kickable = isHost && !you;
            return (
              <motion.button
                key={p.id}
                type="button"
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 20 }}
                disabled={!kickable}
                onClick={() => kickable && setTarget(p)}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-(--radius-card) p-2",
                  kickable && "hover:bg-surface-2",
                )}
              >
                <div className="relative">
                  <Avatar config={normalizeAvatar(p.avatar)} size={64} title={p.name} />
                  {p.isHost && (
                    <Crown
                      size={20}
                      className="absolute -top-2 left-1/2 -translate-x-1/2 text-accent"
                      aria-label="Host"
                    />
                  )}
                  <span
                    className={cn(
                      "absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-bg",
                      p.connected ? "bg-truth" : "bg-fg-faint",
                    )}
                    aria-label={p.connected ? "Connected" : "Away"}
                  />
                </div>
                <span className="max-w-full truncate text-sm text-fg">
                  {p.name}
                </span>
                {you && <span className="text-xs text-fg-muted">you</span>}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      <Sheet open={!!target} onClose={() => setTarget(null)} title={`Remove ${target?.name ?? ""}?`}>
        <p className="mb-4 text-sm text-fg-muted">They can rejoin with the room code.</p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => {
              if (target) onKick(target.id);
              setTarget(null);
            }}
          >
            Remove
          </Button>
        </div>
      </Sheet>
    </section>
  );
}
