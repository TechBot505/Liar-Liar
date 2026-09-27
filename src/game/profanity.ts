/**
 * Small, tasteful profanity mask for family-friendly mode. Not exhaustive —
 * just enough to blunt the obvious. Masks matched words with • bullets,
 * preserving length so the shape reads naturally. Applied to displayed lies
 * and player names when familyMode is on.
 */

const WORDLIST = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "dick",
  "piss",
  "cock",
  "cunt",
  "damn",
  "crap",
  "slut",
  "whore",
  "prick",
];

// Longest-first so multi-word/overlapping matches prefer the longer term.
const sorted = [...WORDLIST].sort((a, b) => b.length - a.length);
const RE = new RegExp(`(${sorted.join("|")})`, "gi");

function bullets(len: number): string {
  return "•".repeat(len);
}

/** Replace any listed profanity (case-insensitive, substring) with bullets. */
export function maskProfanity(text: string): string {
  return text.replace(RE, (m) => bullets(m.length));
}

/** Conditionally mask — no-op when familyMode is off. */
export function maybeMask(text: string, familyMode: boolean): string {
  return familyMode ? maskProfanity(text) : text;
}
