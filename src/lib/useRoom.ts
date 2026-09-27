"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";
import { partyHost } from "@/lib/env";
import type { ClientMessage } from "@/game/protocol";
import type { RoomView } from "@/game/types";
import { useProfileStore } from "@/lib/store/profile";
import { useSeenStore } from "@/lib/store/seen";
import { ClockOffset } from "@/lib/room/offset";
import { buildJoin } from "@/lib/room/join";
import { parseServerMessage } from "@/lib/room/messages";

export type RoomStatus = "connecting" | "open" | "reconnecting" | "closed";
export interface Reaction { playerId: string; emoji: string; at: number }
export type ReactionListener = (r: Reaction) => void;
export interface RoomError { code: string; message: string }

export interface UseRoom {
  view: RoomView | null;
  status: RoomStatus;
  error: RoomError | null;
  kicked: boolean;
  /** Median server clock offset (ms): serverNow ≈ Date.now() + serverOffset. */
  serverOffset: number;
  send: (msg: ClientMessage) => void;
  /** Subscribe to the reaction stream; returns an unsubscribe fn. */
  onReaction: (fn: ReactionListener) => () => void;
}

const HEARTBEAT_MS = 15000;

/**
 * Connects to the PartyKit room `code` on the "main" party, (re)sending `join`
 * on every open, heartbeating, tracking clock offset, and validating every
 * incoming frame. Guest-safe: a profile is created on demand.
 */
export function useRoom(code: string | null): UseRoom {
  const [view, setView] = useState<RoomView | null>(null);
  const [status, setStatus] = useState<RoomStatus>("connecting");
  const [error, setError] = useState<RoomError | null>(null);
  const [kicked, setKicked] = useState(false);
  const [serverOffset, setServerOffset] = useState(0);

  const socketRef = useRef<PartySocket | null>(null);
  const offsetRef = useRef(new ClockOffset());
  const listenersRef = useRef(new Set<ReactionListener>());
  const hadOpenRef = useRef(false);

  const send = useCallback((msg: ClientMessage) => {
    const s = socketRef.current;
    if (s && s.readyState === WebSocket.OPEN) s.send(JSON.stringify(msg));
  }, []);

  const onReaction = useCallback((fn: ReactionListener) => {
    listenersRef.current.add(fn);
    return () => {
      listenersRef.current.delete(fn);
    };
  }, []);

  useEffect(() => {
    if (!code) return;
    hadOpenRef.current = false;
    const socket = new PartySocket({ host: partyHost, room: code, party: "main" });
    socketRef.current = socket;
    setStatus("connecting");

    const sendJoin = () => {
      const profile = useProfileStore.getState().ensureProfile();
      const seen = useSeenStore.getState().allSeen();
      socket.send(JSON.stringify(buildJoin(profile, seen)));
    };

    const handleOpen = () => {
      hadOpenRef.current = true;
      setStatus("open");
      sendJoin();
    };
    const handleClose = () => {
      // PartySocket auto-reconnects; show "reconnecting" once we've been open.
      setStatus(hadOpenRef.current ? "reconnecting" : "connecting");
    };
    const handleMessage = (evt: MessageEvent) => {
      if (typeof evt.data !== "string") return;
      const msg = parseServerMessage(evt.data);
      if (!msg) return;
      switch (msg.type) {
        case "state":
          setView(msg.view);
          offsetRef.current.add(msg.view.now);
          setServerOffset(offsetRef.current.value);
          break;
        case "pong":
          offsetRef.current.add(msg.now);
          setServerOffset(offsetRef.current.value);
          break;
        case "error":
          setError({ code: msg.code, message: msg.message });
          break;
        case "reaction": {
          const r: Reaction = { playerId: msg.playerId, emoji: msg.emoji, at: Date.now() };
          listenersRef.current.forEach((fn) => fn(r));
          break;
        }
        case "kicked":
          setKicked(true);
          break;
      }
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("close", handleClose);
    socket.addEventListener("message", handleMessage);

    const heartbeat = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" } satisfies ClientMessage));
      }
    }, HEARTBEAT_MS);

    return () => {
      clearInterval(heartbeat);
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("close", handleClose);
      socket.removeEventListener("message", handleMessage);
      socket.close();
      socketRef.current = null;
      setStatus("closed");
    };
  }, [code]);

  return { view, status, error, kicked, serverOffset, send, onReaction };
}
