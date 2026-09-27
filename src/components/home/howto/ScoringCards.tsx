"use client";

import type { JSX } from "react";
import { motion } from "motion/react";
import { Card } from "@/components/ui";
import { pageStagger, springUp } from "../motion";

interface Rule {
  points: string;
  title: string;
  body: string;
}

const RULES: Rule[] = [
  { points: "+2", title: "Find the truth", body: "Pick the real answer hiding among the lies." },
  { points: "+1", title: "Fool a friend", body: "Earn a point for every player who picks your lie." },
  { points: "×2", title: "Final round", body: "The last round is worth double when the host enables it." },
];

/** Scoring breakdown as a hairline table + the Truth Comes Out rules. */
export function ScoringCards(): JSX.Element {
  return (
    <motion.section
      variants={pageStagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="flex flex-col gap-3"
      aria-label="Scoring"
    >
      <h2 className="px-1 text-sm font-medium uppercase tracking-wide text-fg-faint">Scoring</h2>
      <Card padding="none" className="overflow-hidden">
        {RULES.map((r, i) => (
          <motion.div
            key={r.title}
            variants={springUp}
            className={`flex items-center gap-4 p-4 ${i > 0 ? "border-t border-line" : ""}`}
          >
            <span className="text-mono w-12 shrink-0 text-2xl font-medium text-accent">{r.points}</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium tracking-tight text-fg">{r.title}</span>
              <span className="text-sm text-fg-muted">{r.body}</span>
            </div>
          </motion.div>
        ))}
      </Card>
      <Card className="flex flex-col gap-1.5">
        <span className="text-display text-base text-fg">The Truth Comes Out</span>
        <span className="text-sm leading-relaxed text-fg-muted">
          One player is the target and answers for real — that becomes the truth. Everyone else writes
          what they think the target would say. Finders get +2, sneaky authors get +1 per fooled friend,
          and the target scores +1 for every player who found their real answer.
        </span>
      </Card>
    </motion.section>
  );
}
