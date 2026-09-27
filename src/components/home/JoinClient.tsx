"use client";

import { useEffect, useState, type JSX } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button, CodeInput, Spinner } from "@/components/ui";
import { useProfileStore } from "@/lib/store/profile";
import { useHydrated } from "@/lib/store/hydrated";
import { isValidCode, normalizeCode } from "@/game/codes";
import { WhoAreYou } from "@/components/home/WhoAreYou";
import { pageEnter } from "@/components/home/motion";

/** Handles /join/[code]: onboard if needed, then enter the room or recover. */
export function JoinClient({ code }: { code: string }): JSX.Element {
  const router = useRouter();
  const hydrated = useHydrated();
  const profile = useProfileStore((s) => s.profile);
  const normalized = normalizeCode(code);
  const valid = isValidCode(normalized);
  const needsOnboarding = !profile || !profile.name;

  const [entry, setEntry] = useState("");

  useEffect(() => {
    if (hydrated && valid && !needsOnboarding) router.replace(`/room/${normalized}`);
  }, [hydrated, valid, needsOnboarding, normalized, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size={32} label="Loading" />
      </div>
    );
  }

  if (valid && needsOnboarding) {
    return (
      <WhoAreYou
        subtitle="Almost in"
        title="Who are you?"
        ctaLabel={`Join ${normalized}`}
        onDone={() => router.replace(`/room/${normalized}`)}
      />
    );
  }

  if (valid) {
    return (
      <div className="flex min-h-dvh items-center justify-center gap-3">
        <Spinner size={28} label="Joining game" />
        <span className="text-fg">Joining {normalized}…</span>
      </div>
    );
  }

  // Invalid code → friendly recovery with a fresh code entry.
  return (
    <motion.main
      {...pageEnter}
      className="safe-top safe-bottom mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-center gap-5 px-5 text-center"
    >
      <span className="text-sm font-medium uppercase tracking-wide text-fg-faint">Hmm</span>
      <h1 className="text-display text-3xl text-fg">
        That code looks <span className="text-serif text-accent">off.</span>
      </h1>
      <p className="text-sm text-fg-muted">
        Codes are 4 letters. Double-check with your host and pop it in below.
      </p>
      <CodeInput value={entry} onChange={setEntry} onComplete={(c) => router.push(`/room/${c}`)} />
      <Button size="lg" fullWidth disabled={entry.length !== 4} onClick={() => router.push(`/room/${entry}`)}>
        Join game
      </Button>
      <Button variant="ghost" fullWidth onClick={() => router.push("/play")}>
        Back home
      </Button>
    </motion.main>
  );
}
