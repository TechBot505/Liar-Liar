"use client";

import type { JSX, ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { isAuthEnabledClient, clerkPublishableKey } from "@/lib/env";
import { CloudSync } from "@/components/auth/CloudSync";

/**
 * Wraps the app in ClerkProvider ONLY when a publishable key is configured.
 * With zero env vars the app renders as guest-only — no auth context mounted.
 *
 * CloudSync is mounted inside ClerkProvider so it can read the session; it runs a
 * one-shot per-session profile/history reconciliation for signed-in users.
 */
export function Providers({ children }: { children: ReactNode }): JSX.Element {
  if (!isAuthEnabledClient) return <>{children}</>;
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <CloudSync />
      {children}
    </ClerkProvider>
  );
}
