"use client";

import { useState, type JSX } from "react";
import { useRouter } from "next/navigation";
import { Button, CodeInput, Sheet } from "@/components/ui";
import { haptic } from "@/lib/haptics";

export interface JoinSheetProps {
  open: boolean;
  onClose: () => void;
  /** Pre-fill the code (e.g. from a ?code=ABCD deep link). */
  initialCode?: string;
}

/** Bottom sheet with a 4-letter code entry that jumps straight into the room. */
export function JoinSheet({ open, onClose, initialCode = "" }: JoinSheetProps): JSX.Element {
  const router = useRouter();
  const [code, setCode] = useState(initialCode.toUpperCase().slice(0, 4));

  const go = (value: string) => {
    if (value.length !== 4) return;
    haptic("submit");
    router.push(`/room/${value}`);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Join a game">
      <div className="flex flex-col gap-5">
        <p className="text-center text-sm text-fg-muted">
          Enter the 4-letter code your host is sharing.
        </p>
        <CodeInput value={code} onChange={setCode} onComplete={go} length={4} />
        <Button size="lg" fullWidth disabled={code.length !== 4} onClick={() => go(code)}>
          Join game
        </Button>
      </div>
    </Sheet>
  );
}
