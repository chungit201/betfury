// Re-runs the matte removal on already-generated raws, without spending another
// Gemini call. Useful when the unmatte thresholds change: the expensive part is
// the generation, the cheap part is the cutout.
//
// Usage: node scripts/process-hero-raw.mjs [option-number ...]
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { unmatteBlack } from "./unmatte-black.mjs";

const DIR = path.join(process.cwd(), "logo-options", "inuslots", "hero");
const TARGET = { width: 1080, height: 760 };

const only = process.argv.slice(2).map(Number).filter(Number.isFinite);
const raws = fs
  .readdirSync(DIR)
  .filter((f) => /^raw-\d+\.png$/.test(f))
  .filter((f) => !only.length || only.includes(Number(f.match(/\d+/)[0])));

for (const f of raws) {
  const n = f.match(/\d+/)[0];
  const tmp = path.join(DIR, `tmp-${n}.png`);
  const { opaquePct, speckled } = await unmatteBlack(path.join(DIR, f), tmp);
  await sharp(tmp)
    .resize({ ...TARGET, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(DIR, `hero-${n}.png`));
  fs.unlinkSync(tmp);
  console.log(`hero-${n}.png: ${opaquePct}% solid, ${speckled}px of specks removed`);
}
