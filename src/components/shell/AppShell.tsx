"use client";

import { useEffect, useState, type JSX, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";

const SIDEBAR_ID = "app-sidebar";

/**
 * Shell for every non-room page: sticky top bar + slide-in sidebar + a padded,
 * centered content column. Content starts below the 56px top bar (plus safe
 * area) with pt-6; pages provide their own <PageTitle>. The sidebar closes on
 * route change.
 */
export function AppShell({ children }: { children: ReactNode }): JSX.Element {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar onMenu={() => setOpen((v) => !v)} sidebarOpen={open} sidebarId={SIDEBAR_ID} />
      <Sidebar open={open} onClose={() => setOpen(false)} id={SIDEBAR_ID} />
      {/* Outer element carries the safe-area side insets; the inner element owns
          the 16px (20px ≥sm) gutters via Tailwind px-*. Keeping them on separate
          elements avoids the Tailwind-v4 conflict where `.safe-x` (env-based,
          later in source order) would override `px-4` and collapse the gutter. */}
      <main className="safe-x mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        <div
          className="flex-1 px-4 pt-6 sm:px-5"
          style={{ paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
