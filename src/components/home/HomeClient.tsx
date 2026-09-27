"use client";

import { useEffect, type JSX } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProfileStore } from "@/lib/store/profile";
import { useHydrated } from "@/lib/store/hydrated";
import { Spinner } from "@/components/ui";
import { WhoAreYou } from "./WhoAreYou";

const codeParam = (raw: string | null): string =>
  (raw ?? "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);

/**
 * Entry `/` — identity only. If a profile already exists we redirect straight
 * to `/play` (or the room for a ?code deep link) with no flash; otherwise we
 * show the "Select your look" avatar + name creator.
 */
export function HomeClient(): JSX.Element {
  const hydrated = useHydrated();
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const params = useSearchParams();
  const deepCode = codeParam(params.get("code"));
  const hasProfile = Boolean(profile && profile.name);

  const dest = deepCode.length === 4 ? `/room/${deepCode}` : "/play";

  useEffect(() => {
    if (hydrated && hasProfile) router.replace(dest);
  }, [hydrated, hasProfile, dest, router]);

  // Before hydration, or while redirecting an existing profile, show a spinner
  // (no identity form flash).
  if (!hydrated || hasProfile) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size={32} label="Loading" />
      </div>
    );
  }

  return (
    <WhoAreYou
      subtitle="Welcome"
      title={
        <>
          Select your <span className="text-serif text-accent">look</span>
        </>
      }
      ctaLabel={deepCode.length === 4 ? `Join ${deepCode}` : "Enter"}
      onDone={() => router.replace(dest)}
    />
  );
}
