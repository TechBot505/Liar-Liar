"use client";

import type { JSX } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui";
import { PageTitle } from "@/components/shell/PageTitle";
import { ScoringCards } from "./ScoringCards";
import { FaqList } from "./FaqList";
import { pageStagger, springUp } from "@/components/home/motion";

const FLOW = [
  { n: "01", title: "Answer", body: "Everyone gets the same prompt and writes a convincing fake answer." },
  { n: "02", title: "Vote", body: "The truth is shuffled in with the lies. Find it — you can't vote for your own." },
  { n: "03", title: "Your verdict", body: "See who fell for your lie, and whether you spotted the truth." },
  { n: "04", title: "Results", body: "Lies are unmasked one by one, then the real answer is revealed." },
  { n: "05", title: "Scoreboard", body: "Points tally up each round; a podium and awards crown the winner." },
];

/** Clean rules article: round flow + scoring + FAQ. */
export function HowToPlayClient(): JSX.Element {
  return (
    <div className="flex flex-col gap-8">
      <PageTitle eyebrow="The rules">How to play</PageTitle>

      <motion.section
        variants={pageStagger}
        initial="hidden"
        animate="show"
        className="flex flex-col"
        aria-label="Round flow"
      >
        <h2 className="px-1 pb-2 text-sm font-medium uppercase tracking-wide text-fg-faint">
          Round flow
        </h2>
        {FLOW.map((s) => (
          <motion.div key={s.n} variants={springUp} className="flex gap-4 border-t border-line py-4">
            <span className="text-mono text-sm text-fg-faint">{s.n}</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium tracking-tight text-fg">{s.title}</span>
              <span className="text-sm text-fg-muted">{s.body}</span>
            </div>
          </motion.div>
        ))}
      </motion.section>

      <ScoringCards />
      <FaqList />

      <Link href="/play" className="mt-2">
        <Button size="lg" fullWidth>Let’s play</Button>
      </Link>
    </div>
  );
}
