"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Show a live "x/max" character counter (uses maxLength). */
  counter?: boolean;
}

/** Hairline text field with optional label, error text, and char counter. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, counter, id, className, value, maxLength, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errId = `${inputId}-err`;
  const count = typeof value === "string" ? value.length : 0;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="px-1 text-sm font-medium tracking-tight text-fg-muted">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
        className={cn(
          "h-12 w-full rounded-(--radius-input) border border-line bg-surface px-4 text-base text-fg",
          "placeholder:text-fg-faint transition-colors",
          "focus:outline-none focus-visible:border-accent",
          error && "border-accent",
          className,
        )}
        {...rest}
      />
      <div className="flex min-h-4 items-center justify-between px-1 text-xs">
        <span id={errId} className="font-medium text-accent" role={error ? "alert" : undefined}>
          {error}
        </span>
        {counter && maxLength && (
          <span className="text-mono text-fg-faint">
            {count}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});
