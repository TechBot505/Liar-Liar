// Generates PNG PWA icons from public/icon.svg using sharp.
// Run: node scripts/gen-icons.mjs  (sharp is a project dependency)
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = await readFile(join(root, "public", "icon.svg"));
const INK = { r: 10, g: 10, b: 11, alpha: 1 };

async function plain(size, out) {
  const png = await sharp(svg).resize(size, size).png().toBuffer();
  await writeFile(out, png);
  console.log("wrote", out);
}

// Maskable: full-bleed ink background with the logo inset into the safe zone.
async function maskable(size, out) {
  const inset = Math.round(size * 0.78);
  const logo = await sharp(svg).resize(inset, inset).png().toBuffer();
  const off = Math.round((size - inset) / 2);
  const png = await sharp({
    create: { width: size, height: size, channels: 4, background: INK },
  })
    .composite([{ input: logo, top: off, left: off }])
    .png()
    .toBuffer();
  await writeFile(out, png);
  console.log("wrote", out);
}

await plain(192, join(root, "public", "icon-192.png"));
await plain(512, join(root, "public", "icon-512.png"));
await plain(180, join(root, "src", "app", "apple-icon.png"));
await maskable(512, join(root, "public", "icon-maskable.png"));
