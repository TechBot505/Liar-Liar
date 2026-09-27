"use client";

import type { JSX, ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";
import { playSound } from "@/lib/sound";
import { Spinner } from "./Spinner";

/** New variants + backward-compatible aliases (pink/cyan map to the new set). */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "danger-outline"
  | "pink"
  | "cyan";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg border-transparent",
  secondary: "bg-surface-2 text-fg border-line",
  ghost: "bg-transparent text-fg border-transparent shadow-none",
  danger: "bg-accent text-accent-fg border-transparent",
  "danger-outline": "bg-transparent text-accent border-accent shadow-none",
  // deprecated aliases
  pink: "bg-accent text-accent-fg border-transparent",
  cyan: "bg-surface-2 text-fg border-line",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm rounded-(--radius-pill)",
  md: "h-12 px-5 text-base rounded-(--radius-card)",
  lg: "h-[52px] px-7 text-base rounded-(--radius-card)",
};

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

/**
 * Minimal button: solid coral primary, hairline surface secondary, text-only
 * ghost. Press = scale 0.97 + slight darken (quick spring). No 3D offset.
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  onClick,
  ...rest
}: ButtonProps): JSX.Element {
  const isDisabled = disabled || loading;
  return (
    <motion.button
      type="button"
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : { scale: 0.97, filter: "brightness(0.92)" }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      onClick={(e) => {
        if (isDisabled) return;
        haptic("tap");
        playSound("tap");
        onClick?.(e);
      }}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 border font-medium tracking-tight shadow-soft no-tap-highlight",
        "transition-colors disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-2 disabled:text-fg-faint disabled:shadow-none",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading && <Spinner size={16} />}
      {children}
    </motion.button>
  );
}
