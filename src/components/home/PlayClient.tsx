"use client";

import { useEffect, useState, type JSX } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useProfileStore } from "@/lib/store/profile";
import { useHydrated } from "@/lib/store/hydrated";
import { Spinner } from "@/components/ui";
import { Hero } from "./Hero";
import { DeckCarousel } from "./DeckCarousel";
import { RecentGames } from "./RecentGames";
import { CreateGameSheet, useCreateIntent } from "./CreateGameSheet";
import { JoinSheet } from "./JoinSheet";
import { EditProfileSheet } from "./EditProfileSheet";
import { pageStagger } from "./motion";
import { getDeck } from "@/decks/registry";

const codeParam = (raw: string | null): string =>
  (raw ?? "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);

/**
 * The /play hub: greeting, create/join actions, deck preview, and recent games.
 * Requires a profile — without one we bounce to the identity page `/`,
 * preserving any ?code so the join flow survives the round-trip.
 */
export function PlayClient(): JSX.Element {
  const hydrated = useHydrated();
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const params = useSearchParams();
  const deepCode = codeParam(params.get("code"));
  const createIntent = useCreateIntent();
  const hasProfile = Boolean(profile && profile.name);

  const [sheet, setSheet] = useState<null | "create" | "join" | "edit">(null);
  const [initialDeckId, setInitialDeckId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (hydrated && !hasProfile) {
      router.replace(deepCode.length === 4 ? `/?code=${deepCode}` : "/");
    }
  }, [hydrated, hasProfile, deepCode, router]);

  // A ?code deep link auto-opens the join sheet once we know the player is in.
  useEffect(() => {
    if (hydrated && hasProfile && deepCode.length === 4) setSheet("join");
  }, [hydrated, hasProfile, deepCode]);

  // A ?create=<deckId> deep link (e.g. a "Play this deck" button) opens the
  // create sheet with that deck preselected, then clears the param so a refresh
  // or back-navigation doesn't reopen it.
  useEffect(() => {
    if (!hydrated || !hasProfile || !createIntent) return;
    if (getDeck(createIntent)) {
      setInitialDeckId(createIntent);
      setSheet("create");
    }
    router.replace("/play");
  }, [hydrated, hasProfile, createIntent, router]);

  const closeSheet = () => {
    setSheet(null);
    setInitialDeckId(undefined);
  };

  if (!hydrated || !hasProfile || !profile) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size={32} label="Loading" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        variants={pageStagger}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-8"
      >
        <Hero
          profile={profile}
          onStart={() => setSheet("create")}
          onJoin={() => setSheet("join")}
          onEditAvatar={() => setSheet("edit")}
        />
        <DeckCarousel />
        <RecentGames />
      </motion.div>

      <CreateGameSheet open={sheet === "create"} onClose={closeSheet} initialDeckId={initialDeckId} />
      <JoinSheet open={sheet === "join"} onClose={closeSheet} initialCode={deepCode} />
      <EditProfileSheet open={sheet === "edit"} onClose={closeSheet} />
    </>
  );
}
