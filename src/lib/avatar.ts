import { z } from "zod";

/**
 * AvatarConfig is the single source of truth for a player's pebble-face avatar.
 * It is sent over the wire in the `join` message, so it is validated with zod
 * (see `avatarConfigSchema`). Every field is a small enum id resolved to SVG by
 * the <Avatar/> renderer. ~8 options per part keeps the builder snappy on mobile.
 *
 * The palette is a curated, muted set that sits calmly on the near-black canvas.
 * Old candy hexes from earlier profiles are migrated in `normalizeAvatar`.
 */

/** Pebble body/face silhouette ids. */
export const FACES = ["egg", "bean", "round", "tall", "chubby", "drop", "square", "gem"] as const;
/**
 * Body fill colors — 8 muted, harmonious tones:
 * clay, sand, sage, slate, dusk, rose, stone, ocean.
 */
export const COLORS = [
  "#B08968", // clay
  "#C9B79C", // sand
  "#9CAF88", // sage
  "#7D8CA3", // slate
  "#8B7BA8", // dusk
  "#C08B99", // rose
  "#A8A29E", // stone
  "#6E9C8E", // ocean
] as const;
/** Eye style ids. */
export const EYES = ["dot", "wide", "sleepy", "wink", "happy", "shifty", "star", "line"] as const;
/** Mouth style ids. */
export const MOUTHS = ["smile", "grin", "smirk", "oh", "flat", "tongue", "teeth", "frown"] as const;
/** Accessory ids ("none" = bare). */
export const ACCESSORIES = ["none", "glasses", "shades", "hat", "crown", "headphones", "bow", "antenna"] as const;
/** Background disc ids — muted dark tints, one per body tone. */
export const BGS = [
  "#201C1A", // clay-dark
  "#24211B", // sand-dark
  "#1C231C", // sage-dark
  "#1A1F26", // slate-dark
  "#221E28", // dusk-dark
  "#261D22", // rose-dark
  "#222220", // stone-dark
  "#182320", // ocean-dark
] as const;

export type FaceId = (typeof FACES)[number];
export type ColorId = (typeof COLORS)[number];
export type EyesId = (typeof EYES)[number];
export type MouthId = (typeof MOUTHS)[number];
export type AccessoryId = (typeof ACCESSORIES)[number];
export type BgId = (typeof BGS)[number];

export type AvatarConfig = {
  face: FaceId;
  color: ColorId;
  eyes: EyesId;
  mouth: MouthId;
  accessory: AccessoryId;
  bg: BgId;
};

/** A safe default used as the fallback when an incoming avatar is malformed. */
export const DEFAULT_AVATAR: AvatarConfig = {
  face: "egg",
  color: "#9CAF88",
  eyes: "wide",
  mouth: "grin",
  accessory: "none",
  bg: "#1C231C",
};

/** Old candy palette → new muted palette (index-aligned migration). */
const LEGACY_COLORS: Record<string, ColorId> = {
  "#FF4D8D": COLORS[0], "#FFD23F": COLORS[1], "#31E1F7": COLORS[2], "#B4FF39": COLORS[3],
  "#9B5DE5": COLORS[4], "#FF7A45": COLORS[5], "#4DE1A0": COLORS[6], "#FF5C5C": COLORS[7],
};
const LEGACY_BGS: Record<string, BgId> = {
  "#2A2350": BGS[0], "#3A1F5C": BGS[1], "#12324A": BGS[2], "#0E3B2E": BGS[3],
  "#4A1F3D": BGS[4], "#3D2A12": BGS[5], "#1E2A4A": BGS[6], "#4A2A2A": BGS[7],
};

/** Each field independently `.catch`es to a sensible option, so partial/loose
 *  avatars (e.g. the old `{}` blob) still validate — backward compatible. */
export const avatarConfigSchema = z.object({
  face: z.enum(FACES).catch(FACES[0]),
  color: z.enum(COLORS).catch(COLORS[2]),
  eyes: z.enum(EYES).catch(EYES[1]),
  mouth: z.enum(MOUTHS).catch(MOUTHS[1]),
  accessory: z.enum(ACCESSORIES).catch(ACCESSORIES[0]),
  bg: z.enum(BGS).catch(BGS[2]),
});

export type AvatarConfigInput = z.input<typeof avatarConfigSchema>;

/** The option rows the AvatarBuilder renders, in display order. */
export const AVATAR_PARTS = [
  { key: "face", label: "Shape", options: FACES },
  { key: "color", label: "Color", options: COLORS },
  { key: "eyes", label: "Eyes", options: EYES },
  { key: "mouth", label: "Mouth", options: MOUTHS },
  { key: "accessory", label: "Extras", options: ACCESSORIES },
  { key: "bg", label: "Backdrop", options: BGS },
] as const;

/** Mulberry32 — tiny deterministic PRNG so `randomAvatar(seed)` is stable. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: readonly T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

/** Deterministic when `seed` is given (same seed ⇒ same avatar), random otherwise. */
export function randomAvatar(seed?: string): AvatarConfig {
  const rnd = seed ? mulberry32(hashSeed(seed)) : Math.random;
  return {
    face: pick(FACES, rnd),
    color: pick(COLORS, rnd),
    eyes: pick(EYES, rnd),
    mouth: pick(MOUTHS, rnd),
    accessory: pick(ACCESSORIES, rnd),
    bg: pick(BGS, rnd),
  };
}

/** Coerce any unknown value into a valid AvatarConfig (used on load/hydrate).
 *  Legacy candy hexes are migrated to the nearest new palette entry first. */
export function normalizeAvatar(value: unknown): AvatarConfig {
  let input = value;
  if (input && typeof input === "object") {
    const v = input as Record<string, unknown>;
    input = {
      ...v,
      color: typeof v.color === "string" && v.color in LEGACY_COLORS ? LEGACY_COLORS[v.color] : v.color,
      bg: typeof v.bg === "string" && v.bg in LEGACY_BGS ? LEGACY_BGS[v.bg] : v.bg,
    };
  }
  const parsed = avatarConfigSchema.safeParse(input);
  return parsed.success ? parsed.data : DEFAULT_AVATAR;
}
