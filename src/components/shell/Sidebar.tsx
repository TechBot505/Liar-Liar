"use client";

import { useEffect, useRef, type JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { cn } from "@/lib/cn";
import { Wordmark } from "@/components/home/Wordmark";
import { NAV_ITEMS, isActiveRoute } from "./navItems";
import { SidebarAccount } from "./SidebarAccount";

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
  /** id used by the top bar's aria-controls. */
  id: string;
}

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Slide-in left drawer: focus trap, Esc / backdrop / swipe-left to close. */
export function Sidebar({ open, onClose, id }: SidebarProps): JSX.Element {
  const pathname = usePathname();
  const panelRef = useRef<HTMLElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo): void => {
    if (info.offset.x < -60 || info.velocity.x < -400) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40">
          <motion.div
            className="absolute inset-0 bg-bg/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.nav
            ref={panelRef}
            id={id}
            aria-label="Main navigation"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.6, right: 0 }}
            onDragEnd={onDragEnd}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
            style={{ width: "min(84vw, 320px)" }}
            className="safe-top safe-bottom absolute inset-y-0 left-0 z-10 flex flex-col border-r border-line bg-surface shadow-soft"
          >
            <div className="flex items-center px-4 pb-4 pt-3">
              <Wordmark size="sm" />
            </div>

            <ul className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
              {NAV_ITEMS.map((item) => {
                const active = isActiveRoute(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "no-tap-highlight relative flex items-center gap-3 rounded-(--radius-input) px-3 py-3 text-base font-medium transition-colors",
                        active ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg",
                      )}
                    >
                      {active && (
                        <span
                          className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent"
                          aria-hidden
                        />
                      )}
                      <Icon size={20} aria-hidden className={active ? "text-accent" : undefined} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <SidebarAccount />
            <p className="px-4 pb-2 pt-3 text-xs text-fg-faint">Liar Liar · made for game nights</p>
          </motion.nav>
        </div>
      )}
    </AnimatePresence>
  );
}
