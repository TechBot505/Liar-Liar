"use client";

import { useState, type JSX } from "react";
import { Share2 } from "lucide-react";
import type { FinalState, RoomView } from "@/game/types";
import { Button, toast } from "@/components/ui";
import type { ButtonSize, ButtonVariant } from "@/components/ui/Button";
import { appUrl } from "@/lib/env";
import { normalizeAvatar } from "@/lib/avatar";
import { getDeck } from "@/decks/registry";
import { awardMeta } from "@/components/room/final/awardMeta";
import { playerLookup } from "@/components/room/util";
import { CARD_H, CARD_W, renderResultCard, type CardData } from "./renderCard";

export interface ResultCardProps {
  view: RoomView;
  final: FinalState;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

function buildData(view: RoomView, final: FinalState): CardData {
  const lookup = playerLookup(view.players);
  return {
    deckName: getDeck(view.settings.deckId)?.name ?? "Liar Liar",
    appUrl,
    podium: final.standings
      .filter((s) => s.rank <= 3)
      .map((s) => {
        const a = normalizeAvatar(s.avatar);
        return { name: s.name, score: s.score, color: a.color, bg: a.bg, rank: s.rank };
      }),
    awards: final.awards.map((a) => ({
      emoji: awardMeta(a.id).emoji,
      label: a.label,
      winner: lookup(a.playerId)?.name ?? "—",
    })),
  };
}

/** Renders a 1080×1350 results image and shares (files API) or downloads it. */
export function ResultCard({ view, final, variant = "primary", size = "lg", className }: ResultCardProps): JSX.Element {
  const [busy, setBusy] = useState(false);

  const share = async (): Promise<void> => {
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = CARD_W;
      canvas.height = CARD_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no-2d-context");
      renderResultCard(ctx, buildData(view, final));

      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("no-blob");
      const file = new File([blob], `liarliar-${view.code}.png`, { type: "image/png" });

      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: "Liar Liar", text: "I just played Liar Liar!" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        toast("Saved your results card!", "success");
      }
    } catch {
      toast("Couldn't create the card", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant={variant} fullWidth size={size} loading={busy} className={className} onClick={() => void share()}>
      <Share2 size={18} aria-hidden /> Share results
    </Button>
  );
}
