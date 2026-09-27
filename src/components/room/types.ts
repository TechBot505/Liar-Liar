import type { ClientMessage } from "@/game/protocol";
import type { RoomView } from "@/game/types";
import type { RoomError } from "@/lib/useRoom";

/**
 * Props every phase component receives from RoomScreen. This is the shared
 * contract with the concurrently-built Reveal/Scores/Final phases — keep it in
 * sync with those imports.
 */
export interface PhaseProps {
  view: RoomView;
  send: (msg: ClientMessage) => void;
  serverOffset: number;
  isHost: boolean;
  me: RoomView["players"][number] | undefined;
}

/**
 * Extra props the lobby/answering/voting phases (built here) need on top of the
 * shared contract: whether the local player is spectating this round (inferred
 * from the server's `not_active` error, since RoomView has no `active` flag),
 * and the latest server error so answering/voting can render inline feedback.
 */
export interface LivePhaseProps extends PhaseProps {
  spectating: boolean;
  error: RoomError | null;
}

const ERROR_COPY: Record<string, string> = {
  room_taken: "That room is already taken.",
  host_only: "Only the host can do that.",
  bad_phase: "Too late for that right now.",
  need_players: "Need at least 2 players — 3+ is more fun.",
  bad_settings: "Those settings aren't valid.",
  not_active: "You're in! You'll join the next round.",
  bad_lie: "Your lie must be 1–60 characters.",
  too_close: "Too close to the truth! Try another lie.",
  target_no_vote: "Sit back — they're guessing YOUR answer.",
  bad_option: "That option is no longer available.",
  own_lie: "You can't vote for your own lie.",
  room_exists: "That room is already taken.",
};

/** Map a server error code to friendly copy for toasts. */
export function friendlyError(code: string, fallback?: string): string {
  return ERROR_COPY[code] ?? fallback ?? "Something went wrong.";
}
