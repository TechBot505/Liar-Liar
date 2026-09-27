"use client";

import type { JSX } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Hide the visible label but keep it for screen readers. */
  hideLabel?: boolean;
  disabled?: boolean;
}

/** iOS-style on/off switch with a springy thumb. Accent track when on. */
export function Toggle({ checked, onChange, label, hideLabel, disabled }: ToggleProps): JSX.Element {
  return (
    <label className={cn("flex items-center gap-3", disabled && "opacity-40")}>
      {!hideLabel && <span className="font-medium tracking-tight text-fg">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={hideLabel ? label : undefined}
        disabled={disabled}
        onClick={() => {
          haptic("select");
          onChange(!checked);
        }}
        className="no-tap-highlight relative flex h-11 w-12 shrink-0 items-center justify-center"
      >
        <span
          className={cn(
            "relative h-7 w-12 rounded-full border transition-colors",
            checked ? "border-transparent bg-accent" : "border-line bg-surface-2",
          )}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className={cn(
              "absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-fg shadow-raise",
              checked ? "right-1" : "left-1",
            )}
          />
        </span>
      </button>
    </label>
  );
}
