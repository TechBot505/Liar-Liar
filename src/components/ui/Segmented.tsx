"use client";

import { useId, type JSX } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string | number> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
}

/** Segmented control with a subtle sliding pill (shared layoutId). */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedProps<T>): JSX.Element {
  const groupId = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "flex gap-1 rounded-(--radius-input) border border-line bg-surface p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              haptic("select");
              onChange(opt.value);
            }}
            className={cn(
              "no-tap-highlight relative flex min-h-11 flex-1 items-center justify-center rounded-[10px] px-3 py-2 text-sm font-medium tracking-tight transition-colors",
              active ? "text-fg" : "text-fg-muted hover:text-fg",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${groupId}`}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-[10px] border border-line bg-surface-2 shadow-raise"
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
