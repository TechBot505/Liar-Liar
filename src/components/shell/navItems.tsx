import { HelpCircle, History, Home, Layers, User, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Primary navigation shown in the sidebar for every non-room page. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/play", label: "Play", icon: Home },
  { href: "/decks", label: "Decks", icon: Layers },
  { href: "/how-to-play", label: "How to play", icon: HelpCircle },
  { href: "/history", label: "History", icon: History },
  { href: "/profile", label: "Profile", icon: User },
] as const;

/** True when `pathname` is (or is nested under) the given nav href. */
export function isActiveRoute(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}
