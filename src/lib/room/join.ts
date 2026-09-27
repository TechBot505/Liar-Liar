import type { JoinMessage } from "@/game/protocol";
import type { Profile } from "@/lib/store/types";

/** Max seen ids sent on join (server merges across all joined players). */
export const SEEN_CAP = 800;

/**
 * Build the `join` message from the local profile + flattened seen list.
 * Sent on every (re)connect so a dropped socket resumes the same seat.
 */
export function buildJoin(profile: Profile, seen: string[]): JoinMessage {
  return {
    type: "join",
    playerId: profile.id,
    token: profile.token,
    name: profile.name || "Player",
    avatar: profile.avatar,
    seen: seen.slice(0, SEEN_CAP),
  };
}
