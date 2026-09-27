"use client";

import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import { cn } from "@/lib/cn";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  /** Optional pinned footer (e.g. the primary action) that stays visible while content scrolls. */
  footer?: ReactNode;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

/** Bottom sheet on mobile (drag down to dismiss), centered dialog on desktop. */
export function Sheet({ open, onClose, children, title, className, footer }: SheetProps): JSX.Element {
  const panelRef = useRef<HTMLDivElement>(null);
  // Drag-to-dismiss is started ONLY from the grabber/header (dragListener=false below).
  // Letting the whole panel listen for drags swallowed touch gestures and blocked
  // native scrolling of long content on mobile.
  const dragControls = useDragControls();
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Tab" && panel) {
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

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-bg/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={onDragEnd}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
            className={cn(
              "safe-bottom relative z-10 flex max-h-[90dvh] overflow-hidden w-full max-w-md flex-col rounded-t-[20px] border-t border-line bg-surface [--pad-bottom:20px]",
              "shadow-soft sm:rounded-[20px] sm:border",
              className,
            )}
          >
            <div
              className="shrink-0 cursor-grab touch-none px-5 pt-3 active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-fg-faint/60 sm:hidden" aria-hidden />
              {title && <h2 className="text-display mb-3 text-xl text-fg">{title}</h2>}
            </div>
            <div
              data-sheet-scroll
              className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-5 [-webkit-overflow-scrolling:touch]"
            >
              {children}
            </div>
            {footer && <div className="shrink-0 border-t border-line px-5 pt-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
