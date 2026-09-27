"use client";

import { useState, type JSX, type ReactNode } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { AvatarBuilder } from "@/components/avatar/AvatarBuilder";
import { randomAvatar, type AvatarConfig } from "@/lib/avatar";
import { useProfileStore } from "@/lib/store/profile";
import { pageEnter } from "./motion";
import { checkName, randomFunnyName } from "./names";

export interface WhoAreYouProps {
  /** Called once a valid name + avatar are saved to the profile store. */
  onDone: () => void;
  /** Optional heading override (e.g. join flow). */
  title?: ReactNode;
  subtitle?: string;
  ctaLabel?: string;
}

/** Full-screen identity creator: avatar builder + name, then save profile. */
export function WhoAreYou({ onDone, title, subtitle, ctaLabel }: WhoAreYouProps): JSX.Element {
  const setIdentity = useProfileStore((s) => s.setIdentity);
  const existing = useProfileStore((s) => s.profile);
  const [name, setName] = useState(existing?.name ?? "");
  const [avatar, setAvatar] = useState<AvatarConfig>(existing?.avatar ?? randomAvatar());
  const [touched, setTouched] = useState(false);

  const check = checkName(name);
  const showError = touched && !check.ok;

  const surprise = () => setName(randomFunnyName(name.trim()));

  const submit = () => {
    setTouched(true);
    if (!check.ok) return;
    setIdentity(name.trim(), avatar);
    onDone();
  };

  return (
    <motion.main
      {...pageEnter}
      className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-6 px-5"
      style={{
        paddingTop: "max(32px, calc(env(safe-area-inset-top) + 24px))",
        paddingBottom: "max(40px, calc(env(safe-area-inset-bottom) + 24px))",
      }}
    >
      <header className="flex flex-col items-center gap-2 text-center">
        <span className="text-sm font-medium uppercase tracking-wide text-fg-faint">
          {subtitle ?? "New here"}
        </span>
        <h1 className="text-display text-3xl text-fg">
          {title ?? (
            <>
              Who are <span className="text-serif text-accent">you?</span>
            </>
          )}
        </h1>
        <p className="text-sm text-fg-muted">Build a face and pick a name. Takes 20 seconds.</p>
      </header>

      <AvatarBuilder value={avatar} onChange={setAvatar} />

      <div className="flex flex-col gap-2">
        <Input
          label="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(true)}
          maxLength={16}
          counter
          placeholder="e.g. Captain Fib"
          error={showError ? check.error : undefined}
          enterKeyHint="done"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button
          type="button"
          onClick={surprise}
          className="no-tap-highlight inline-flex min-h-11 items-center justify-center gap-1.5 self-center rounded-(--radius-input) px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
        >
          <Sparkles size={16} aria-hidden /> Surprise me
        </button>
      </div>

      <Button size="lg" fullWidth onClick={submit} className="mt-auto">
        {ctaLabel ?? "Continue"}
      </Button>
    </motion.main>
  );
}
