/**
 * Room codes: 4 uppercase letters from an unambiguous alphabet (no I/O to avoid
 * confusion with 1/0). Pure — the caller supplies randomness so generation stays
 * testable and deterministic when needed.
 */

export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";
export const CODE_LENGTH = 4;

const CODE_RE = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

/** Generate a room code using the given random source (defaults to Math.random). */
export function generateCode(rand: () => number = Math.random): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length)];
  }
  return code;
}

/** True when `code` is exactly 4 chars from the allowed alphabet. */
export function isValidCode(code: string): boolean {
  return CODE_RE.test(code);
}

/** Normalize user input (trim + uppercase) before validating. */
export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase();
}
