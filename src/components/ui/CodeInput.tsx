"use client";

import { useRef, type ChangeEvent, type ClipboardEvent, type JSX, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";

export interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
  /** Fired when all `length` boxes are filled. */
  onComplete?: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
  error?: boolean;
}

const clean = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, "");

/** Elegant mono boxes for room codes: auto-advance, paste, backspace, accent focus. */
export function CodeInput({
  value,
  onChange,
  onComplete,
  length = 4,
  autoFocus = true,
  error = false,
}: CodeInputProps): JSX.Element {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = Array.from({ length }, (_, i) => value[i] ?? "");

  const commit = (next: string) => {
    onChange(next);
    if (next.length === length) onComplete?.(next);
  };

  const focusBox = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const handleChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const typed = clean(e.target.value);
    if (!typed) return;
    const arr = value.split("");
    arr[i] = typed[typed.length - 1];
    const next = arr.join("").slice(0, length);
    haptic("tap");
    commit(next);
    focusBox(i + 1);
  };

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const arr = value.split("");
      if (arr[i]) arr[i] = "";
      else if (i > 0) {
        arr[i - 1] = "";
        focusBox(i - 1);
      }
      commit(arr.join(""));
    } else if (e.key === "ArrowLeft") focusBox(i - 1);
    else if (e.key === "ArrowRight") focusBox(i + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const next = clean(e.clipboardData.getData("text")).slice(0, length);
    commit(next);
    focusBox(next.length);
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="Room code">
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={c}
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          aria-label={`Letter ${i + 1}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "text-mono size-14 rounded-(--radius-input) border border-line bg-surface text-center text-3xl",
            "font-medium uppercase text-fg caret-accent shadow-soft transition-colors",
            "focus:outline-none focus-visible:border-accent sm:size-16",
            error && "border-accent",
          )}
        />
      ))}
    </div>
  );
}
