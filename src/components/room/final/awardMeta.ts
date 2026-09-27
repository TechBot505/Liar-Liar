import type { Award } from "@/game/types";
import type { PlayerLookup } from "../util";

/** Static per-award icon. Unknown ids fall back to a trophy. */
const EMOJI: Record<string, string> = {
  biggest_liar: "🤥",
  lie_detector: "🕵️",
  most_gullible: "🐑",
  silver_tongue: "🪄",
  honest: "😇",
  speed_demon: "⚡",
  last_second: "🐌",
  nemesis: "😈",
};

export interface AwardMeta {
  emoji: string;
}

export function awardMeta(id: string): AwardMeta {
  return { emoji: EMOJI[id] ?? "🏆" };
}

/** A cheeky one-liner for each award, filled with player names + values. */
export function awardSubtitle(award: Award, lookup: PlayerLookup): string {
  const other = award.secondaryPlayerId ? lookup(award.secondaryPlayerId)?.name ?? "someone" : "";
  switch (award.id) {
    case "biggest_liar":
      return `Fooled ${award.value} gullible souls`;
    case "lie_detector":
      return `Sniffed out ${award.value} truths`;
    case "most_gullible":
      return `Fell for ${award.value} sweet little lies`;
    case "silver_tongue":
      return award.detail ? `“${award.detail}”` : `One lie fooled ${award.value} people`;
    case "honest":
      return "Wrote lies. Fooled precisely nobody.";
    case "speed_demon":
      return `Avg ${(award.value / 1000).toFixed(1)}s to submit`;
    case "last_second":
      return `Avg ${(award.value / 1000).toFixed(1)}s — cutting it close`;
    case "nemesis":
      return `Owned ${other} ${award.value}×`;
    default:
      return "";
  }
}
