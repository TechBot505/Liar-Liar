import { z } from "zod";
import type { RoomView } from "./types";
import { normalizeAvatar } from "@/lib/avatar";

/**
 * Wire protocol — every client→server message is validated with these zod
 * schemas on both ends. Server→client messages are typed but trusted (server
 * is the author). Keep in sync with SPEC "Protocol".
 */

export const REACTION_EMOJIS = ["😂", "🤯", "😈", "👏", "💀"] as const;

/**
 * Avatar validation. The wire/static type stays a loose record (backward
 * compatible with the engine's opaque `AvatarConfig` and existing tests that
 * send `{}`), but the value is normalized at parse time into a valid
 * AvatarConfig (unknown/partial fields fall back to defaults).
 */
export const avatarSchema = z
  .record(z.string(), z.unknown())
  .transform((v): Record<string, unknown> => normalizeAvatar(v));

export const settingsSchema = z.object({
  deckId: z.string().min(1),
  rounds: z.union([z.literal(5), z.literal(7), z.literal(10)]),
  answerSeconds: z.union([z.literal(30), z.literal(45), z.literal(60), z.literal(90)]),
  voteSeconds: z.union([z.literal(20), z.literal(30), z.literal(45)]),
  doubleFinal: z.boolean(),
  familyMode: z.boolean(),
});

const nameSchema = z.string().trim().min(1).max(16);

export const joinSchema = z.object({
  type: z.literal("join"),
  playerId: z.string().min(1).max(64),
  token: z.string().min(1).max(64),
  name: nameSchema,
  avatar: avatarSchema,
  seen: z.array(z.string().max(64)).max(2000).default([]),
});

export const createSchema = z.object({
  type: z.literal("create"),
  settings: settingsSchema,
});

export const updateSettingsSchema = z.object({
  type: z.literal("updateSettings"),
  settings: settingsSchema.partial(),
});

export const startSchema = z.object({ type: z.literal("start") });

export const submitLieSchema = z.object({
  type: z.literal("submitLie"),
  text: z.string().min(1).max(200),
});

export const voteSchema = z.object({
  type: z.literal("vote"),
  optionId: z.string().min(1).max(64),
});

export const nextSchema = z.object({ type: z.literal("next") });

export const reactSchema = z.object({
  type: z.literal("react"),
  emoji: z.enum(REACTION_EMOJIS),
});

export const kickSchema = z.object({
  type: z.literal("kick"),
  playerId: z.string().min(1).max(64),
});

export const playAgainSchema = z.object({ type: z.literal("playAgain") });
export const leaveSchema = z.object({ type: z.literal("leave") });
export const pingSchema = z.object({ type: z.literal("ping") });

export const clientMessageSchema = z.discriminatedUnion("type", [
  joinSchema,
  createSchema,
  updateSettingsSchema,
  startSchema,
  submitLieSchema,
  voteSchema,
  nextSchema,
  reactSchema,
  kickSchema,
  playAgainSchema,
  leaveSchema,
  pingSchema,
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;
export type JoinMessage = z.infer<typeof joinSchema>;
export type ClientMessageType = ClientMessage["type"];

/** Parse+validate raw JSON text into a ClientMessage, or return null. */
export function parseClientMessage(raw: string): ClientMessage | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = clientMessageSchema.safeParse(data);
  return result.success ? result.data : null;
}

/** Server → client message shapes. */
export type ServerMessage =
  | { type: "state"; view: RoomView }
  | { type: "error"; code: string; message: string }
  | { type: "reaction"; playerId: string; emoji: string }
  | { type: "kicked" }
  | { type: "pong"; now: number };
