"use client";

import { useRouter } from "next/navigation";
import type { JSX, ReactNode } from "react";
import { Button, Sticker } from "@/components/ui";

export interface RoomErrorProps {
  title: string;
  message: string;
  emoji?: string;
  action?: ReactNode;
}

/** Centered full-screen error / dead-end fallback with a route home. */
export function RoomError({ title, message, emoji = "🫥", action }: RoomErrorProps): JSX.Element {
  const router = useRouter();
  return (
    <main className="safe-top safe-bottom mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="text-6xl" aria-hidden>
        {emoji}
      </span>
      <Sticker>Uh oh</Sticker>
      <h1 className="text-display text-3xl text-fg">{title}</h1>
      <p className="max-w-xs text-sm text-fg-muted">{message}</p>
      {action ?? (
        <Button size="lg" variant="secondary" onClick={() => router.push("/play")}>
          Back home
        </Button>
      )}
    </main>
  );
}
