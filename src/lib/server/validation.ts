/**
 * Zod schemas for API request bodies. Kept separate so routes stay small and the
 * shapes can be reused/tested.
 *
 * The incoming game record mirrors GameRecord in src/game/types.ts. Avatar and
 * per-player stats are opaque blobs stored as jsonb, so they are validated
 * permissively (object of unknown values) rather than pinned to a rigid shape.
 */
import { z } from "zod";
import { avatarConfigSchema } from "@/lib/avatar";

const jsonObject = z.record(z.string(), z.unknown());

export const gamePlayerRecordSchema = z.object({
  seatId: z.string().min(1),
  name: z.string().min(1).max(64),
  avatar: jsonObject,
  score: z.number().int(),
  rank: z.number().int(),
  stats: jsonObject,
  tokenHash: z.string().min(1),
});

export const gameRecordSchema = z.object({
  code: z.string().min(1).max(16),
  deckId: z.string().min(1).max(64),
  rounds: z.number().int().positive(),
  startedAt: z.number().int(),
  endedAt: z.number().int(),
  players: z.array(gamePlayerRecordSchema).min(1).max(12),
  // Awards are accepted for forward-compat but not persisted (no column yet).
  awards: z.array(z.unknown()).optional(),
});

export type GameRecordInput = z.infer<typeof gameRecordSchema>;

export const claimSchema = z.object({
  tokens: z.array(z.string().min(1)).min(1).max(200),
});

/**
 * Profile body. `avatar` is validated with the shared avatarConfigSchema from
 * src/lib/avatar.ts (each field `.catch`es to a safe default, so loose/partial
 * avatars still normalize to a valid AvatarConfig).
 */
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(16),
  avatar: avatarConfigSchema,
});

export type ProfileInput = z.infer<typeof profileSchema>;
