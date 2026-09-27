import type { JSX } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound(): JSX.Element {
  return (
    <main className="mx-auto grid min-h-dvh max-w-[480px] place-items-center px-5 text-center">
      <div className="flex flex-col items-center gap-5">
        <span className="text-mono text-sm text-fg-faint">404</span>
        <h1 className="text-display text-4xl text-fg">
          That page is a <span className="text-serif text-accent">lie.</span>
        </h1>
        <p className="max-w-xs text-sm text-fg-muted">
          We hunted for the truth and came up empty. This page doesn&apos;t exist… or does it?
        </p>
        <Link href="/play">
          <Button size="lg">Go home</Button>
        </Link>
      </div>
    </main>
  );
}
