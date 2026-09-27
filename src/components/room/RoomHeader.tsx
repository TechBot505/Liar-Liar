"use client";

import { useState, type JSX } from "react";
import { LogOut, Volume2, VolumeX } from "lucide-react";
import { Button, IconButton, Sheet } from "@/components/ui";
import { usePrefsStore } from "@/lib/store/prefs";

export interface RoomHeaderProps {
  code: string;
  /** Confirmed leave: send `leave` then navigate home. */
  onLeave: () => void;
}

/** Sticky top bar: leave (with confirm), room code, and a sound mute toggle. */
export function RoomHeader({ code, onLeave }: RoomHeaderProps): JSX.Element {
  const sound = usePrefsStore((s) => s.sound);
  const toggleSound = usePrefsStore((s) => s.toggleSound);
  const [confirm, setConfirm] = useState(false);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-2 px-[max(16px,env(safe-area-inset-left))] pb-2"
      style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
    >
      <IconButton label="Leave room" size={40} className="rounded-full" onClick={() => setConfirm(true)}>
        <LogOut size={20} aria-hidden />
      </IconButton>

      <span className="text-mono text-sm tracking-[0.3em] text-fg-muted">
        {code}
      </span>

      <IconButton
        label={sound ? "Mute sound" : "Unmute sound"}
        size={40}
        className="rounded-full"
        aria-pressed={!sound}
        onClick={toggleSound}
      >
        {sound ? <Volume2 size={20} aria-hidden /> : <VolumeX size={20} aria-hidden />}
      </IconButton>

      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Leave this game?">
        <p className="mb-4 text-sm text-fg-muted">
          You can rejoin with the same code while the game is running.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" fullWidth onClick={() => setConfirm(false)}>
            Stay
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => {
              setConfirm(false);
              onLeave();
            }}
          >
            Leave
          </Button>
        </div>
      </Sheet>
    </header>
  );
}
