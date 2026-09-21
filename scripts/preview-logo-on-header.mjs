// Composites each candidate logo onto the real header background (#111923) at the
// size it actually renders in Header.tsx, so contrast can be judged as shipped
// rather than against the transparency checkerboard.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const HEADER_BG = "#111923";
const HEADER_HEIGHT = 64;
const LOGO_HEIGHT = 36;

const dir = process.argv[2] || path.join("logo-options", "inuslots", "dark");
const absDir = path.resolve(process.cwd(), dir);
const files = fs
  .readdirSync(absDir)
  .filter((f) => f.endsWith(".png") && !f.startsWith("preview-") && !f.startsWith("raw-"));

// Contact sheet is rendered at 3x so the 36px-tall lockups are actually
// inspectable, then downsampled strips show the true shipping size.
const SCALE = 3;
const rows = [];
let sheetWidth = 0;

for (const f of files) {
  const logo = await sharp(path.join(absDir, f))
    .resize({ height: LOGO_HEIGHT * SCALE })
    .toBuffer();
  const { width } = await sharp(logo).metadata();
  rows.push({ f, logo, width });
  sheetWidth = Math.max(sheetWidth, width + 48 * SCALE);
  console.log(`${f} -> renders ${Math.round(width / SCALE)}x${LOGO_HEIGHT}px in the header`);
}

const rowHeight = HEADER_HEIGHT * SCALE;
const outPath = path.join(absDir, "preview-on-header.png");
await sharp({
  create: {
    width: sheetWidth,
    height: rowHeight * rows.length,
    channels: 4,
    background: HEADER_BG,
  },
})
  .composite(
    rows.map((r, i) => ({
      input: r.logo,
      top: i * rowHeight + Math.round((rowHeight - LOGO_HEIGHT * SCALE) / 2),
      left: 24 * SCALE,
    }))
  )
  .png()
  .toFile(outPath);

console.log(`\nContact sheet (${SCALE}x, top to bottom: ${rows.map((r) => r.f).join(", ")}):`);
console.log(path.relative(process.cwd(), outPath));
