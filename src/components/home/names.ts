import { maskProfanity } from "@/game/profanity";

/** A pile of cheeky liar-themed handles for the "surprise me" button. */
export const FUNNY_NAMES = [
  "Captain Fib",
  "Sir Lies-a-Lot",
  "Baron von Bluff",
  "Fibby McFibface",
  "The Fabricator",
  "Truthless Todd",
  "Pants McFire",
  "Sneaky Beaky",
  "Whopper Wendy",
  "Deceptacon",
  "Slippery Sam",
  "Bluff Daddy",
  "Tall Tale Tara",
  "Foolio",
  "Con Artiste",
  "Smooth Liar",
  "Nonsense Nate",
  "Prof. Poppycock",
  "Lady Deceit",
  "Hoodwink Hank",
] as const;

/** Pick a random funny name, avoiding `avoid` when possible. */
export function randomFunnyName(avoid?: string): string {
  const pool = FUNNY_NAMES.filter((n) => n !== avoid);
  const list = pool.length > 0 ? pool : FUNNY_NAMES;
  return list[Math.floor(Math.random() * list.length)];
}

export interface NameCheck {
  ok: boolean;
  error?: string;
}

/** Validate a display name: 1–16 chars after trim, profanity-free-ish. */
export function checkName(raw: string): NameCheck {
  const name = raw.trim();
  if (name.length === 0) return { ok: false, error: "Give yourself a name first" };
  if (name.length > 16) return { ok: false, error: "16 characters max" };
  if (maskProfanity(name) !== name) return { ok: false, error: "Keep it clean-ish!" };
  return { ok: true };
}
