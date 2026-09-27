/**
 * Fuzzy "too close to the truth" matching plus lie normalization for merging
 * duplicate lies. Pure string logic — safe everywhere.
 */

const ARTICLES = new Set(["the", "a", "an"]);

/** Lowercase, strip punctuation, collapse whitespace. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split into tokens with leading articles removed. */
export function tokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((t) => t.length > 0 && !ARTICLES.has(t));
}

/**
 * Canonical form used to merge identical lies: normalized, article-stripped,
 * tokens sorted so "the big dog" and "dog big" collapse together.
 */
export function normalizeLie(text: string): string {
  return tokens(text).sort().join(" ");
}

/** Classic Levenshtein edit distance. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}

/** True when token multisets are equal (order-independent word match). */
export function tokenSetEqual(a: string, b: string): boolean {
  const ta = tokens(a).sort();
  const tb = tokens(b).sort();
  if (ta.length !== tb.length) return false;
  return ta.every((t, i) => t === tb[i]);
}

function closeEnough(lie: string, target: string): boolean {
  const nl = normalize(lie);
  const nt = normalize(target);
  if (nl.length === 0 || nt.length === 0) return false;
  if (nl === nt) return true;
  if (tokenSetEqual(lie, target)) return true;
  // Levenshtein threshold scales down for short strings to avoid false hits.
  const shorter = Math.min(nl.length, nt.length);
  const threshold = shorter <= 4 ? 1 : 2;
  return levenshtein(nl, nt) <= threshold;
}

/**
 * True when `lie` is too close to the real answer or any of its accepted
 * alternate forms (deck `alts`). Used to reject lies during answering.
 */
export function isTooCloseToTruth(
  lie: string,
  answer: string,
  alts: readonly string[] = [],
): boolean {
  if (closeEnough(lie, answer)) return true;
  return alts.some((alt) => closeEnough(lie, alt));
}
