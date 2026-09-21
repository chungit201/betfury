// Contact sheet of the hero banner candidates composited onto the hero
// section's actual background (#0c172d, sampled from a page screenshot), so the
// cutout edges and the blue grade can be judged the way they will ship rather
// than against a transparency checkerboard.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const HERO_BG = "#0c172d";
const CELL = { width: 540, height: 380 };

const dir = path.resolve(process.cwd(), "logo-options", "inuslots", "hero");
const files = fs.readdirSync(dir).filter((f) => /^hero-\d+\.png$/.test(f)).sort();

const cells = [];
for (const f of files) {
  cells.push(
    await sharp(path.join(dir, f))
      .resize({ ...CELL, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer()
  );
}

const cols = 2;
const rows = Math.ceil(cells.length / cols);
const outPath = path.join(dir, "preview-on-bg.png");

await sharp({
  create: {
    width: CELL.width * cols,
    height: CELL.height * rows,
    channels: 4,
    background: HERO_BG,
  },
})
  .composite(
    cells.map((input, i) => ({
      input,
      left: (i % cols) * CELL.width,
      top: Math.floor(i / cols) * CELL.height,
    }))
  )
  .png()
  .toFile(outPath);

console.log(`Order: ${files.join(", ")}`);
console.log(path.relative(process.cwd(), outPath));
