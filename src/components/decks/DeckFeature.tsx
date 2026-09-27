"use client";

import type { JSX } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import type { Deck } from "@/decks/types";
import { Button, Sticker } from "@/components/ui";
import { springUp } from "@/components/home/motion";
import { DeckArt } from "./DeckArt";

/** Turn a raw prompt into a display sample: fill {target} + soften blanks. */
function sample(prompt: string): string {
  return prompt.replace(/\{target\}/g, "someone").replace(/_{2,}/g, "______");
}

/** Large deck showcase: big art, name, description, 3 sample prompts, Play button. */
export function DeckFeature({ deck }: { deck: Deck }): JSX.Element {
  const router = useRouter();
  const prompts = deck.questions.slice(0, 3).map((q) => sample(q.prompt));
  return (
    <motion.article
      variants={springUp}
      className="flex flex-col overflow-hidden rounded-(--radius-card) border border-line bg-surface shadow-soft"
    >
      <div className="relative">
        <DeckArt deckId={deck.id} size="lg" className="rounded-none" />
        {deck.adult && (
          <Sticker tone="accent" className="absolute right-3 top-3 px-2 py-0.5 text-[0.6rem]">
            18+
          </Sticker>
        )}
      </div>
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <span className="text-display text-xl text-fg">{deck.name}</span>
          <span className="text-xs text-fg-muted">{deck.tagline}</span>
        </div>
        <p className="text-sm leading-relaxed text-fg-muted">{deck.description}</p>
        <span className="text-xs font-medium uppercase tracking-wide text-fg-faint">Sample prompts</span>
        <ul className="flex flex-col gap-2">
          {prompts.map((p, i) => (
            <li key={i} className="rounded-(--radius-input) border border-line bg-surface-2 p-3 text-sm text-fg">
              “{p}”
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between gap-3">
          <span className="text-mono text-[0.7rem] uppercase tracking-wide text-fg-faint">
            {deck.questions.length} prompts · answers hidden
          </span>
          <Button
            size="sm"
            className="shrink-0"
            aria-label={`Play ${deck.name}`}
            onClick={() => router.push(`/play?create=${deck.id}`)}
          >
            <Play size={16} aria-hidden /> Play
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
