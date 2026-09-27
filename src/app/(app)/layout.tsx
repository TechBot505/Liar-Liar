import type { JSX, ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";

/** Route-group layout: wraps /play, /decks, /how-to-play, /history, /profile
 * in the shared app shell (top bar + sidebar). URLs are unchanged. */
export default function AppGroupLayout({ children }: { children: ReactNode }): JSX.Element {
  return <AppShell>{children}</AppShell>;
}
