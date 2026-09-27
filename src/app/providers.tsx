"use client";

import type { JSX, ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { isAuthEnabledClient, clerkPublishableKey } from "@/lib/env";
import { CloudSync } from "@/components/auth/CloudSync";
import { AuthBridge } from "@/components/auth/AuthBridge";

/**
 * Wraps the app in ClerkProvider ONLY when a publishable key is configured.
 * With zero env vars the app renders as guest-only — no auth context mounted.
 *
 * CloudSync is mounted inside ClerkProvider so it can read the session; it runs a
 * one-shot per-session profile/history reconciliation for signed-in users.
 * AuthBridge mirrors the session state into a provider-free store for guest-safe
 * hooks that render both in and out of the provider.
 */
export function Providers({ children }: { children: ReactNode }): JSX.Element {
  if (!isAuthEnabledClient) return <>{children}</>;
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <AuthBridge />
      <CloudSync />
      {children}
    </ClerkProvider>
  );
}
