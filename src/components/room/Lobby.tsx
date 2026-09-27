"use client";

import { useEffect, useState, type JSX } from "react";
import { motion } from "motion/react";
import { Copy, QrCode, Settings2, Share2 } from "lucide-react";
import type { PhaseProps } from "./types";
import { Button, Card, IconButton, Sheet, toast } from "@/components/ui";
import { getDeck } from "@/decks/registry";
import { inviteUrl, qrDataUrl, shareInvite } from "@/lib/share";
import { haptic } from "@/lib/haptics";
import { LobbyPlayers } from "./LobbyPlayers";
import { LobbySettingsSheet } from "./LobbySettingsSheet";
import { HowToTips } from "./HowToTips";
import { PhaseLayout } from "./PhaseLayout";

/** LOBBY — invite/QR, player grid, deck + settings card, and start controls. */
export function Lobby({ view, send, isHost }: PhaseProps): JSX.Element {
  const { code, players, settings, hostId } = view;
  const [showQr, setShowQr] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [qr, setQr] = useState("");
  const deck = getDeck(settings.deckId);
  const canStart = players.length >= 2;
  const hostName = players.find((p) => p.id === hostId)?.name ?? "the host";

  useEffect(() => {
    if (showQr && !qr) qrDataUrl(code).then(setQr).catch(() => setQr(""));
  }, [showQr, qr, code]);

  const copy = async () => {
    haptic("tap");
    try {
      await navigator.clipboard.writeText(inviteUrl(code));
      toast("Invite link copied!", "success");
    } catch {
      toast(`Room code: ${code}`, "info");
    }
  };
  const share = async () => {
    const { method } = await shareInvite(code);
    if (method === "clipboard") toast("Invite link copied!", "success");
  };

  const dock = isHost ? (
    <div className="flex flex-col items-center gap-2">
      <Button size="lg" fullWidth disabled={!canStart} onClick={() => send({ type: "start" })}>
        Start game
      </Button>
      {!canStart && <p className="text-sm text-fg-muted">Need at least 2 players — 3+ is more fun.</p>}
    </div>
  ) : (
    <p aria-live="polite" className="text-center text-sm text-fg-muted">
      Waiting for {hostName} to start
      <AnimatedDots />
    </p>
  );

  return (
    <PhaseLayout title={null} dock={dock}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs uppercase tracking-wide text-fg-faint">Room code</span>
          <button
            type="button"
            onClick={copy}
            aria-label={`Room code ${code}. Tap to copy invite link.`}
            className="text-mono text-6xl tracking-[0.15em] text-fg no-tap-highlight"
          >
            {code}
          </button>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={share}>
              <Share2 size={16} aria-hidden /> Invite
            </Button>
            <Button size="sm" variant="secondary" onClick={copy}>
              <Copy size={16} aria-hidden /> Copy
            </Button>
            <IconButton label="Show QR code" size={40} subtle onClick={() => setShowQr(true)}>
              <QrCode size={18} aria-hidden />
            </IconButton>
          </div>
        </div>

        <LobbyPlayers players={players} youId={view.you} isHost={isHost} onKick={(id) => send({ type: "kick", playerId: id })} />

        <Card className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>{deck?.emoji ?? "🎴"}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-fg">{deck?.name ?? settings.deckId}</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {[
                `${settings.rounds} rounds`,
                `${settings.answerSeconds}s answer`,
                `${settings.voteSeconds}s vote`,
                ...(settings.doubleFinal ? ["×2 final"] : []),
                ...(settings.familyMode ? ["Family"] : []),
              ].map((chip) => (
                <span
                  key={chip}
                  className="rounded-(--radius-pill) border border-line bg-surface-2 px-2 py-0.5 text-xs text-fg-muted"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
          {isHost && (
            <IconButton label="Edit settings" size={40} subtle onClick={() => setShowSettings(true)}>
              <Settings2 size={18} aria-hidden />
            </IconButton>
          )}
        </Card>

        <HowToTips />
      </div>

      <Sheet open={showQr} onClose={() => setShowQr(false)} title="Scan to join">
        <div className="flex flex-col items-center gap-3 pb-2">
          {qr ? (
            <motion.img
              src={qr}
              alt={`QR code to join room ${code}`}
              width={240}
              height={240}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-(--radius-card) bg-fg p-2"
            />
          ) : (
            <div className="size-60 animate-pulse rounded-(--radius-card) bg-surface-2" />
          )}
          <p className="text-mono text-2xl tracking-[0.2em] text-fg">{code}</p>
        </div>
      </Sheet>

      {isHost && (
        <LobbySettingsSheet
          open={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onChange={(patch) => send({ type: "updateSettings", settings: patch })}
        />
      )}
    </PhaseLayout>
  );
}

function AnimatedDots(): JSX.Element {
  return (
    <span className="inline-flex">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}>
          .
        </motion.span>
      ))}
    </span>
  );
}
