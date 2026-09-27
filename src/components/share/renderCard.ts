export interface CardPlayer {
  name: string;
  score: number;
  color: string;
  bg: string;
  rank: number;
}

export interface CardAward {
  emoji: string;
  label: string;
  winner: string;
}

export interface CardData {
  deckName: string;
  appUrl: string;
  podium: CardPlayer[];
  awards: CardAward[];
}

export const CARD_W = 1080;
export const CARD_H = 1350;

const BG = "#0A0A0B";
const SURFACE = "#131316";
const LINE = "rgba(255,255,255,0.08)";
const FG = "#F5F5F4";
const FG_MUTED = "#A1A1AA";
const FG_FAINT = "#52525B";
const ACCENT = "#FF5A4E";

const SANS = "system-ui, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

function avatarDisc(ctx: CanvasRenderingContext2D, p: CardPlayer, cx: number, cy: number, r: number): void {
  ctx.fillStyle = p.bg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = BG;
  ctx.font = `600 ${Math.round(r * 0.8)}px ${SANS}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((p.name[0] ?? "?").toUpperCase(), cx, cy + 2);
}

/** Paint the minimal 1080×1350 shareable results card. */
export function renderResultCard(ctx: CanvasRenderingContext2D, data: CardData): void {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Wordmark — serif italic "Liar" (coral) + sans "Liar" (fg).
  ctx.textBaseline = "alphabetic";
  const liarSerif = "italic 700 96px " + SERIF;
  const liarSans = "600 88px " + SANS;
  ctx.font = liarSerif;
  const wSerif = ctx.measureText("Liar").width;
  ctx.font = liarSans;
  const wSans = ctx.measureText("Liar").width;
  const gap = 24;
  const startX = (CARD_W - (wSerif + gap + wSans)) / 2;
  ctx.textAlign = "left";
  ctx.font = liarSerif;
  ctx.fillStyle = ACCENT;
  ctx.fillText("Liar", startX, 210);
  ctx.font = liarSans;
  ctx.fillStyle = FG;
  ctx.fillText("Liar", startX + wSerif + gap, 210);

  // Deck name — tracked uppercase, muted.
  ctx.textAlign = "center";
  ctx.fillStyle = FG_MUTED;
  ctx.font = "500 34px " + SANS;
  ctx.fillText(data.deckName.toUpperCase(), CARD_W / 2, 280);

  // Hairline rule.
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(90, 360);
  ctx.lineTo(CARD_W - 90, 360);
  ctx.stroke();

  // Top 3 rows.
  const top3 = data.podium.filter((p) => p.rank <= 3).sort((a, b) => a.rank - b.rank);
  let y = 470;
  const rowH = 200;
  for (const p of top3) {
    const first = p.rank === 1;
    ctx.fillStyle = SURFACE;
    roundRect(ctx, 90, y - 80, CARD_W - 180, 160, 24);
    ctx.fill();
    if (first) {
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 3;
      roundRect(ctx, 90, y - 80, CARD_W - 180, 160, 24);
      ctx.stroke();
    }
    ctx.fillStyle = first ? ACCENT : FG_FAINT;
    ctx.font = "600 60px " + SANS;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(String(p.rank), 140, y);
    avatarDisc(ctx, p, 260, y, 58);
    ctx.fillStyle = FG;
    ctx.font = "600 52px " + SANS;
    ctx.textAlign = "left";
    ctx.fillText(p.name.slice(0, 14), 340, y);
    ctx.fillStyle = first ? ACCENT : FG;
    ctx.font = "600 60px " + SANS;
    ctx.textAlign = "right";
    ctx.fillText(String(p.score), CARD_W - 140, y);
    y += rowH;
  }

  // Footer wordmark.
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = ACCENT;
  ctx.font = "italic 700 44px " + SERIF;
  ctx.fillText("liarliar", CARD_W / 2, CARD_H - 110);
  ctx.fillStyle = FG_FAINT;
  ctx.font = "500 30px " + SANS;
  ctx.fillText(data.appUrl.replace(/^https?:\/\//, ""), CARD_W / 2, CARD_H - 64);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
