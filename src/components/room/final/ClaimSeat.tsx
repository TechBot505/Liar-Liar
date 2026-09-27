"use client";

import { useEffect, useRef, type JSX } from "react";
import { useUser } from "@clerk/nextjs";
import { useProfileStore } from "@/lib/store/profile";

/**
 * Claims the current guest seat token for a signed-in user, once. Mounted ONLY
 * when auth is enabled (a ClerkProvider is present). 401/503/network failures
 * are swallowed — claiming is best-effort.
 */
export function ClaimSeat(): JSX.Element | null {
  const { isSignedIn } = useUser();
  const done = useRef(false);

  useEffect(() => {
    if (!isSignedIn || done.current) return;
    const token = useProfileStore.getState().profile?.token;
    if (!token) return;
    done.current = true;
    void fetch("/api/history/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokens: [token] }),
    }).catch(() => {
      /* best-effort */
    });
  }, [isSignedIn]);

  return null;
}
