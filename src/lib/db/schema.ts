/**
 * Drizzle (Postgres) schema for Liar Liar cloud persistence.
 *
 * All cloud storage is OPTIONAL — the app runs fully without a database (guest,
 * local-only history). When DATABASE_URL is set these tables back cloud profiles,
 * play history, and (future) custom decks.
 *
 * Avatar blobs are stored as jsonb (opaque AvatarConfig owned by the client).
 * `token_hash` is the sha256 of a player's secret seat token, letting a signed-in
 * user later claim the seats they played (see POST /api/history/claim).
 */
import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

/** One row per Clerk user. `id` IS the Clerk user id. */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Cloud copy of a user's display profile. */
export const profiles = pgTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  avatar: jsonb("avatar").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** One finished game. `id` is the record id assigned by the party server. */
export const games = pgTable("games", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  deckId: text("deck_id").notNull(),
  rounds: integer("rounds").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }).notNull(),
  playerCount: integer("player_count").notNull(),
});

/** One seat within a finished game. `user_id` is filled in once a user claims it. */
export const gamePlayers = pgTable(
  "game_players",
  {
    id: serial("id").primaryKey(),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    seatId: text("seat_id").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    avatar: jsonb("avatar").notNull(),
    score: integer("score").notNull(),
    rank: integer("rank").notNull(),
    stats: jsonb("stats").notNull(),
    tokenHash: text("token_hash").notNull(),
  },
  (t) => [
    unique("game_players_game_seat_uq").on(t.gameId, t.seatId),
    index("game_players_token_hash_idx").on(t.tokenHash),
    index("game_players_user_id_idx").on(t.userId),
  ],
);

/**
 * Seat tokens a user has claimed. Lets a finished game auto-link a seat to its
 * owner at POST time (when its token_hash is already known) instead of requiring
 * a later /api/history/claim. The claim endpoint also populates this table.
 */
export const userTokens = pgTable(
  "user_tokens",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    unique("user_tokens_token_hash_uq").on(t.tokenHash),
    index("user_tokens_user_id_idx").on(t.userId),
  ],
);

/** Future: user-authored decks (schema only for now). */
export const customDecks = pgTable("custom_decks", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  emoji: text("emoji"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Future: questions belonging to a custom deck (schema only for now). */
export const customQuestions = pgTable("custom_questions", {
  id: serial("id").primaryKey(),
  deckId: text("deck_id")
    .notNull()
    .references(() => customDecks.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  answer: text("answer").notNull(),
});
