import QRCode from "qrcode";
import { appUrl } from "@/lib/env";

/** Deep link that drops a friend straight into the room's join flow. */
export function inviteUrl(code: string): string {
  return `${appUrl}/join/${code.toUpperCase()}`;
}

export interface ShareResult {
  method: "share" | "clipboard" | "none";
}

/**
 * Share an invite via the Web Share API, falling back to the clipboard. Returns
 * how the link was surfaced so callers can toast "Copied!" vs. nothing.
 */
export async function shareInvite(code: string, text?: string): Promise<ShareResult> {
  const url = inviteUrl(code);
  const payload = {
    title: "Liar Liar",
    text: text ?? `Join my Liar Liar game — code ${code.toUpperCase()}`,
    url,
  };
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(payload);
      return { method: "share" };
    } catch {
      // User dismissed the sheet or share failed — fall through to clipboard.
    }
  }
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url);
      return { method: "clipboard" };
    } catch {
      // Clipboard blocked (permissions / insecure context).
    }
  }
  return { method: "none" };
}

/** Render an invite link as a QR-code data URL (for the lobby / share card). */
export async function qrDataUrl(code: string): Promise<string> {
  return QRCode.toDataURL(inviteUrl(code), {
    margin: 1,
    width: 320,
    color: { dark: "#0E0B1F", light: "#FDF6E9" },
  });
}
