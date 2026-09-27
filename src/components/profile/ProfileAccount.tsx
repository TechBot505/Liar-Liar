"use client";

import type { JSX } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Card } from "@/components/ui";

/**
 * Account controls, mounted ONLY when auth is enabled (ClerkProvider present).
 * Signed-in users get the Clerk UserButton; signed-out users get a sign-in CTA.
 */
export function ProfileAccount(): JSX.Element {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div>
        <p className="font-medium tracking-tight text-fg">Account</p>
        <p className="text-xs text-fg-muted">Sync your profile & history across devices.</p>
      </div>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="no-tap-highlight h-11 rounded-(--radius-card) border border-line bg-surface-2 px-5 text-sm font-medium text-fg shadow-soft">
            Sign in
          </button>
        </SignInButton>
      </SignedOut>
    </Card>
  );
}
