import type { JSX, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface PageTitleProps {
  children: ReactNode;
  /** Optional eyebrow label rendered above the title. */
  eyebrow?: string;
  className?: string;
}

/**
 * Consistent page heading for every shell page. Sits directly below the sticky
 * top bar (the layout owns the top padding). Use the serif accent sparingly via
 * inline <span className="text-serif text-accent"> in `children`.
 */
export function PageTitle({ children, eyebrow, className }: PageTitleProps): JSX.Element {
  return (
    <div className={cn("mb-5 flex flex-col gap-1", className)}>
      {eyebrow && (
        <span className="text-sm font-medium uppercase tracking-wide text-fg-faint">{eyebrow}</span>
      )}
      <h1 className="text-display text-3xl text-fg">{children}</h1>
    </div>
  );
}
