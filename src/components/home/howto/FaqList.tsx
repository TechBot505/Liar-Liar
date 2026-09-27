"use client";

import { useState, type JSX } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui";

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  { q: "How many players?", a: "2 to 12. It sings with 4+ — the more liars, the more chaos." },
  { q: "Do I need an account?", a: "Nope. Play as a guest instantly. Signing in just saves your profile and history to the cloud." },
  { q: "What if my lie is too close to the truth?", a: "We'll nudge you to try again — a lie that matches the real answer would be unfair." },
  { q: "Can I join a game in progress?", a: "Yes. Late joiners hop in from the next round with a fresh scoreboard seat." },
  { q: "What's family-friendly mode?", a: "On by default: it hides adult decks and masks spicy language. Hosts can turn it off." },
];

function Item({ faq }: { faq: Faq }): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <Card padding="none" className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="no-tap-highlight flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="font-medium tracking-tight text-fg">{faq.q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0 text-fg-muted">
          <ChevronDown size={20} aria-hidden />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
          >
            <p className="px-4 pb-4 text-sm leading-relaxed text-fg-muted">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

/** Collapsible FAQ list. */
export function FaqList(): JSX.Element {
  return (
    <section className="flex flex-col gap-3" aria-label="FAQ">
      <h2 className="px-1 text-sm font-medium uppercase tracking-wide text-fg-faint">FAQ</h2>
      <div className="flex flex-col gap-2">
        {FAQS.map((f) => (
          <Item key={f.q} faq={f} />
        ))}
      </div>
    </section>
  );
}
