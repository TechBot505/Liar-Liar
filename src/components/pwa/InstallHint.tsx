"use client";

import { useEffect, useState, type JSX } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Share, X } from "lucide-react";
import { useHydrated } from "@/lib/store/hydrated";

const VISITS_KEY = "ll:visits";
/** Timestamp (ms) the hint was last shown or dismissed — throttles to once/7 days. */
const SHOWN_AT_KEY = "ll:installHintAt";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isIosSafariStandaloneCapable(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const standalone = (navigator as unknown as { standalone?: boolean }).standalone;
  return isIos && !standalone;
}

/**
 * Dismissible "Add to Home Screen" tip for iOS, shown from the 2nd visit on,
 * at most once every 7 days. Never rendered on /room/* routes (it would cover
 * the answer input / Lock-in button), and docked to the top so it never
 * overlays a page's primary bottom actions.
 */
export function InstallHint(): JSX.Element | null {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const inRoom = pathname?.startsWith("/room") ?? false;

  useEffect(() => {
    if (typeof window === "undefined" || inRoom) return;
    const visits = Number(localStorage.getItem(VISITS_KEY) ?? "0") + 1;
    localStorage.setItem(VISITS_KEY, String(visits));
    const lastAt = Number(localStorage.getItem(SHOWN_AT_KEY) ?? "0");
    const throttled = Date.now() - lastAt < WEEK_MS;
    if (!throttled && visits >= 2 && isIosSafariStandaloneCapable()) {
      localStorage.setItem(SHOWN_AT_KEY, String(Date.now()));
      setShow(true);
    }
  }, [inRoom]);

  const dismiss = () => {
    localStorage.setItem(SHOWN_AT_KEY, String(Date.now()));
    setShow(false);
  };

  if (!hydrated || inRoom) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="dialog"
          aria-label="Install Liar Liar"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          className="safe-top fixed inset-x-3 top-3 z-40 mx-auto max-w-sm"
        >
          <div className="glass flex items-center gap-3 rounded-(--radius-card) p-3 text-fg shadow-soft">
            <p className="flex-1 text-sm">
              Add Liar Liar to your Home Screen: tap <Share size={14} className="inline align-text-bottom" aria-label="Share" /> then “Add to Home Screen”.
            </p>
            <button type="button" onClick={dismiss} aria-label="Dismiss" className="rounded-full p-1 text-fg-muted transition-colors hover:text-fg">
              <X size={18} aria-hidden />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
