"use client";

import { useState, type JSX } from "react";
import { Button, Input, Sticker } from "@/components/ui";
import { AvatarBuilder } from "@/components/avatar/AvatarBuilder";
import { randomAvatar, type AvatarConfig } from "@/lib/avatar";
import { useProfileStore } from "@/lib/store/profile";
import { primeAudio } from "@/lib/sound";

export interface NoProfileGateProps {
  /** Called after the local identity is saved; RoomScreen then connects. */
  onReady: () => void;
}

/**
 * Inline avatar + name creation shown before connecting when there is no local
 * profile yet. Saves to the profile store, then hands off to the room socket.
 */
export function NoProfileGate({ onReady }: NoProfileGateProps): JSX.Element {
  const setIdentity = useProfileStore((s) => s.setIdentity);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<AvatarConfig>(() => randomAvatar());
  const trimmed = name.trim();

  const join = () => {
    if (!trimmed) return;
    primeAudio();
    setIdentity(trimmed, avatar);
    onReady();
  };

  return (
    <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 py-6 [--pad-top:24px] [--pad-bottom:24px]">
      <div className="flex flex-col items-center gap-2 text-center">
        <Sticker>Almost in</Sticker>
        <h1 className="text-display text-3xl text-fg">Make your player</h1>
        <p className="text-sm text-fg-muted">Pick a look and a name, then jump in.</p>
      </div>

      <AvatarBuilder value={avatar} onChange={setAvatar} />

      <Input
        label="Your name"
        placeholder="e.g. Sneaky Sam"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={16}
        counter
        onKeyDown={(e) => e.key === "Enter" && join()}
      />

      <Button size="lg" fullWidth disabled={!trimmed} onClick={join}>
        Join the room
      </Button>
    </main>
  );
}
