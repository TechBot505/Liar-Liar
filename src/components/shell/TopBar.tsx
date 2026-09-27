"use client";

import type { JSX } from "react";
import { useRouter } from "next/navigation";
import { Menu, User } from "lucide-react";
import { IconButton } from "@/components/ui";
import { Avatar } from "@/components/avatar/Avatar";
import { Wordmark } from "@/components/home/Wordmark";
import { useProfileStore } from "@/lib/store/profile";

export interface TopBarProps {
  /** Toggle the sidebar drawer. */
  onMenu: () => void;
  sidebarOpen: boolean;
  /** id of the controlled sidebar element (for aria-controls). */
  sidebarId: string;
}

/**
 * Sticky top bar: hamburger (left), centered wordmark, avatar → /profile
 * (right). Height is 56px plus the safe-area inset; the layout adds the
 * content padding below it.
 */
export function TopBar({ onMenu, sidebarOpen, sidebarId }: TopBarProps): JSX.Element {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);

  return (
    <header
      className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="safe-x">
        <div className="mx-auto flex h-14 w-full max-w-[480px] items-center justify-between px-4 sm:px-5">
          <IconButton
            label="Open menu"
            size={40}
            subtle
            aria-expanded={sidebarOpen}
            aria-controls={sidebarId}
            onClick={onMenu}
            className="rounded-full"
          >
            <Menu size={22} aria-hidden />
          </IconButton>

          <Wordmark size="sm" />

          <IconButton
            label="Your profile"
            size={40}
            subtle
            onClick={() => router.push("/profile")}
            className="rounded-full"
          >
            {profile ? (
              <Avatar config={profile.avatar} size={30} />
            ) : (
              <User size={22} aria-hidden />
            )}
          </IconButton>
        </div>
      </div>
    </header>
  );
}
