"use client";

import type { JSX, ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";
import { playSound } from "@/lib/sound";

export interface IconButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  /** Required for accessibility — icon-only controls need a label. */
  label: string;
  size?: number;
  children: ReactNode;
  /** Text-only style with no fill/border. */
  subtle?: boolean;
}

/** Square, tappable icon control with a 44px+ hit area and a soft press. */
export function IconButton({
  label,
  size = 44,
  subtle = false,
  className,
  children,
  onClick,
  disabled,
  ...rest
}: IconButtonProps): JSX.Element {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      onClick={(e) => {
        if (disabled) return;
        haptic("tap");
        playSound("tap");
        onClick?.(e);
      }}
      style={{ width: size, height: size }}
      className={cn(
        "no-tap-highlight inline-flex items-center justify-center rounded-(--radius-input) text-fg",
        subtle
          ? "bg-transparent hover:bg-surface-2"
          : "border border-line bg-surface-2 shadow-soft",
        "disabled:opacity-40",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
