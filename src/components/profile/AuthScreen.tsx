"use client";

import type { JSX } from "react";
import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";
import { isAuthEnabledClient } from "@/lib/env";
import { Button } from "@/components/ui";

const APPEARANCE = {
  variables: {
    colorPrimary: "#FF5A4E",
    colorBackground: "#131316",
    colorText: "#F5F5F4",
    colorInputBackground: "#1A1A1F",
    colorInputText: "#F5F5F4",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-geist), system-ui, sans-serif",
  },
  elements: {
    card: "border border-line shadow-soft",
    formButtonPrimary: "text-accent-fg font-medium",
  },
} as const;

/** Clerk sign-in/up when auth is enabled, else a friendly "not configured" page. */
export function AuthScreen({ mode }: { mode: "sign-in" | "sign-up" }): JSX.Element {
  if (!isAuthEnabledClient) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-[480px] place-items-center px-5 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-sm font-medium uppercase tracking-wide text-fg-faint">Guest mode</span>
          <h1 className="text-display text-3xl text-fg">Accounts aren&apos;t set up</h1>
          <p className="max-w-xs text-sm text-fg-muted">
            No sign-in needed here — Liar Liar works fully as a guest, and your history
            is saved right on this device.
          </p>
          <Link href="/play">
            <Button size="lg">Back to the fun</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-8">
      {mode === "sign-in" ? (
        <SignIn appearance={APPEARANCE} path="/sign-in" signUpUrl="/sign-up" />
      ) : (
        <SignUp appearance={APPEARANCE} path="/sign-up" signInUrl="/sign-in" />
      )}
    </main>
  );
}
