"use client";

import { useState, type JSX } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button, CodeInput } from "@/components/ui";
import { PageTitle } from "@/components/shell/PageTitle";
import { haptic } from "@/lib/haptics";
import type { Profile } from "@/lib/store/types";
import { springUp } from "./motion";

export interface HeroProps {
  profile: Profile;
  onStart: () => void;
  onJoin: () => void;
  onEditAvatar: () => void;
}

/** Greeting (tap avatar to edit) + the two primary actions + inline join. */
export function Hero({ profile, onStart, onEditAvatar }: HeroProps): JSX.Element {
  const router = useRouter();
  const [code, setCode] = useState("");
  const firstName = profile.name.split(" ")[0] || profile.name;

  const join = (value: string) => {
    if (value.length !== 4) return;
    haptic("submit");
    router.push(`/room/${value}`);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting uses PageTitle so the h1 sits at the same top offset as every
          other shell page. The top-bar already shows the avatar, so here we
          offer a small "Edit look" pill instead of a duplicate avatar. */}
      <motion.div variants={springUp} className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <PageTitle eyebrow="Welcome back" className="mb-0">
            Hey <span className="text-serif text-accent">{firstName}</span>
          </PageTitle>
          <Button size="sm" variant="secondary" onClick={onEditAvatar} className="shrink-0">
            Edit look
          </Button>
        </div>
        <p className="text-base leading-relaxed text-fg-muted">
          Write a fake answer. Find the real one.
        </p>
      </motion.div>

      <motion.div variants={springUp} className="flex flex-col gap-3">
        <Button size="lg" fullWidth onClick={onStart}>
          Create a game
        </Button>
        <div className="flex flex-col gap-2 rounded-(--radius-card) border border-line bg-surface p-4">
          <span className="px-1 text-sm font-medium tracking-tight text-fg-muted">
            Join with code
          </span>
          <CodeInput value={code} onChange={setCode} onComplete={join} autoFocus={false} />
        </div>
      </motion.div>
    </div>
  );
}
