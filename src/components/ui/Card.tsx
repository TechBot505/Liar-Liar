import type { HTMLAttributes, JSX } from "react";
import { cn } from "@/lib/cn";

export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  /** Adds hover lift + pointer affordance for tappable cards. */
  interactive?: boolean;
}

const PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

/** Raised surface with a hairline border, 14px radius and a very soft shadow. */
export function Card({
  padding = "md",
  interactive = false,
  className,
  children,
  ...rest
}: CardProps): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-(--radius-card) border border-line bg-surface shadow-soft",
        PADDING[padding],
        interactive && "cursor-pointer transition-colors hover:bg-surface-2",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
