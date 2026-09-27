"use client";

import { useMemo, useState, type JSX } from "react";
import { motion } from "motion/react";
import { Eye } from "lucide-react";
import { listDecks } from "@/decks/registry";
import type { Deck } from "@/decks/types";
import { Button, Card, Segmented } from "@/components/ui";
import { PageTitle } from "@/components/shell/PageTitle";
import { pageStagger } from "@/components/home/motion";
import { DeckFeature } from "@/components/decks/DeckFeature";

type Filter = "all" | "trivia" | "about";
const FILTERS = [
  { value: "all" as const, label: "All" },
  { value: "trivia" as const, label: "Trivia" },
  { value: "about" as const, label: "About you" },
];

const match = (d: Deck, f: Filter): boolean =>
  f === "all" || (f === "trivia" ? d.kind === "fact" : d.kind === "player");

/** Browse every deck with big animated art. Adult decks stay behind a reveal. */
export function DecksClient(): JSX.Element {
  const [filter, setFilter] = useState<Filter>("all");
  const [showAdult, setShowAdult] = useState(false);
  const decks = listDecks();

  const family = useMemo(() => decks.filter((d) => !d.adult && match(d, filter)), [decks, filter]);
  const adult = useMemo(() => decks.filter((d) => d.adult && match(d, filter)), [decks, filter]);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle eyebrow="Choose a vibe">Decks</PageTitle>

        <Segmented options={FILTERS} value={filter} onChange={setFilter} label="Filter decks" />

        <motion.div
          key={filter}
          variants={pageStagger}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          {family.map((deck) => (
            <DeckFeature key={deck.id} deck={deck} />
          ))}
        </motion.div>

        <section className="flex flex-col gap-4" aria-label="Adult decks">
          <Card className="flex flex-col items-center gap-3 text-center">
            <span
              className="flex size-11 items-center justify-center rounded-(--radius-input) border border-line bg-surface-2 text-xl"
              aria-hidden
            >
              🔞
            </span>
            <span className="text-display text-base text-fg">Adults-only decks</span>
            <p className="text-sm text-fg-muted">
              Spicier prompts for grown-up groups (18+). Hidden by default.
            </p>
            {!showAdult && (
              <Button variant="secondary" onClick={() => setShowAdult(true)}>
                <Eye size={18} aria-hidden /> Reveal adult decks
              </Button>
            )}
          </Card>
          {showAdult && adult.length > 0 && (
            <motion.div variants={pageStagger} initial="hidden" animate="show" className="flex flex-col gap-4">
              {adult.map((deck) => (
                <DeckFeature key={deck.id} deck={deck} />
              ))}
            </motion.div>
          )}
          {showAdult && adult.length === 0 && (
            <p className="px-1 text-center text-sm text-fg-faint">No adult decks in this filter.</p>
          )}
        </section>
    </div>
  );
}
