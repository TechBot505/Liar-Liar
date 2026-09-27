"use client";

import type { JSX } from "react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { isAuthEnabledClient } from "@/lib/env";

/**
 * Bottom-of-sidebar account block. Clerk components are rendered ONLY when auth
 * is enabled (ClerkProvider present) — otherwise this renders nothing and the
 * sidebar falls back to just the version/credits line.
 *
 * The outer guard runs no hooks, so guest mode (no ClerkProvider) never calls
 * `useAuth()`; the inner component does and is only mounted inside the provider.
 */
export function SidebarAccount(): JSX.Element | null {
  if (!isAuthEnabledClient) return null;
  return <SidebarAccountInner />;
}

/**
 * `<SignedIn>`/`<SignedOut>` were removed in Clerk Core 3; we branch on
 * `useAuth()` instead. While Clerk is still loading we render nothing to avoid a
 * signed-out flash.
 */
function SidebarAccountInner(): JSX.Element | null {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  return (
    <div className="border-t border-line px-2 py-3">
      {isSignedIn ? (
        <div className="flex items-center gap-3">
          <UserButton />
          <span className="text-sm text-fg-muted">Signed in</span>
        </div>
      ) : (
        <SignInButton mode="modal">
          <button
            type="button"
            className="no-tap-highlight w-full rounded-(--radius-card) border border-line bg-surface-2 px-4 py-2.5 text-left text-sm font-medium text-fg shadow-soft"
          >
            Sign in to save your games
          </button>
        </SignInButton>
      )}
    </div>
  );
}
