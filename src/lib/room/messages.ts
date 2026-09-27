import { z } from "zod";
import type { RoomView } from "@/game/types";
import type { ServerMessage } from "@/game/protocol";

/**
 * Client-side validation of server→client frames. The server authors these, but
 * we still `safeParse` and ignore anything malformed so a bad frame can never
 * crash the room. `.catchall` preserves the full RoomView shape (we only assert
 * the envelope + a few required fields, then cast).
 */
const viewSchema = z
  .object({
    code: z.string(),
    phase: z.string(),
    you: z.string(),
    now: z.number(),
    players: z.array(z.unknown()),
  })
  .catchall(z.unknown());

const serverMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("state"), view: viewSchema }),
  z.object({ type: z.literal("error"), code: z.string(), message: z.string() }),
  z.object({ type: z.literal("reaction"), playerId: z.string(), emoji: z.string() }),
  z.object({ type: z.literal("kicked") }),
  z.object({ type: z.literal("pong"), now: z.number() }),
]);

/** Parse a raw frame into a typed ServerMessage, or null when invalid. */
export function parseServerMessage(raw: string): ServerMessage | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = serverMessageSchema.safeParse(data);
  if (!result.success) return null;
  const msg = result.data;
  if (msg.type === "state") {
    return { type: "state", view: msg.view as unknown as RoomView };
  }
  return msg as ServerMessage;
}
