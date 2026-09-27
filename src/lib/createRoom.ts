"use client";

import PartySocket from "partysocket";
import { partyHost } from "@/lib/env";
import { generateCode } from "@/game/codes";
import type { Settings } from "@/game/types";
import type { Profile } from "@/lib/store/types";
import { buildJoin } from "@/lib/room/join";
import { parseServerMessage } from "@/lib/room/messages";
import { useProfileStore } from "@/lib/store/profile";
import { useSeenStore } from "@/lib/store/seen";

const CREATE_TIMEOUT_MS = 8000;

export interface CreateRoomResult {
  code: string;
}

/**
 * Generate a room code, connect, and perform the join→create handshake. If the
 * server rejects with `room_exists` we retry with a fresh code (up to
 * `maxRetries`). Resolves with the created code; the caller then navigates to
 * /room/[code] where useRoom reconnects and resumes the host seat.
 */
export async function createRoom(
  settings: Settings,
  maxRetries = 5,
): Promise<CreateRoomResult> {
  const profile = useProfileStore.getState().ensureProfile();
  const seen = useSeenStore.getState().allSeen();
  let lastError = "unknown";
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const code = generateCode();
    try {
      await attemptCreate(code, settings, profile, seen);
      return { code };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      if (lastError !== "room_exists") throw e;
    }
  }
  throw new Error(`Could not create a room after ${maxRetries} tries (${lastError})`);
}

/** One create attempt against a specific code. Resolves when we become host. */
function attemptCreate(
  code: string,
  settings: Settings,
  profile: Profile,
  seen: string[],
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const socket = new PartySocket({ host: partyHost, room: code, party: "main" });
    let settled = false;

    const cleanup = () => {
      clearTimeout(timer);
      socket.removeEventListener("open", onOpen);
      socket.removeEventListener("message", onMessage);
      socket.close();
    };
    const done = (err?: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (err) reject(err);
      else resolve();
    };

    const timer = setTimeout(() => done(new Error("timeout")), CREATE_TIMEOUT_MS);

    const onOpen = () => {
      socket.send(JSON.stringify(buildJoin(profile, seen)));
      socket.send(JSON.stringify({ type: "create", settings }));
    };
    const onMessage = (evt: MessageEvent) => {
      if (typeof evt.data !== "string") return;
      const msg = parseServerMessage(evt.data);
      if (!msg) return;
      if (msg.type === "error") done(new Error(msg.code));
      else if (msg.type === "state" && msg.view.hostId === profile.id) done();
    };

    socket.addEventListener("open", onOpen);
    socket.addEventListener("message", onMessage);
  });
}
