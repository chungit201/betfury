// Removes the magenta chroma backdrop from a generated lockup and trims the
// result to the artwork.
//
// Gemini does not honour "flat #FF00FF" literally — it renders a noisy pink
// gradient with a darker vignette in the corners (sampled: #D63091 centre,
// #B0877F corner). So the test is hue-shaped rather than a distance to one
// colour: pink means red clearly above green with blue not far below green.
// Every colour in the artwork (white, light blue, navy, black outline, tan
// face) fails that test, which is why magenta was chosen as the key.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { trimAlpha } from "./trim-alpha.mjs";

const isPink = (r, g, b) => r > g + 30 && b > g - 15;

// Much stricter: unmistakably the backdrop, not an anti-aliased blend with it.
// Used to clear backdrop that the border flood fill cannot reach because the
// artwork encloses it — a gap between a logo's outer ring and its inner disc,
// for instance. Only safe when the artwork itself contains no magenta, which is
// why the prompts forbid it.
const isStrongChroma = (r, g, b) => r > g + 60 && b > g + 40 && r > 120 && b > 100;

export async function knockoutChroma(srcPath, outPath, { trim = true, pad = 2, removeEnclosed = false } = {}) {
  const img = sharp(srcPath).ensureAlpha();
  const { width, height } = await img.metadata();
  const raw = await img.raw().toBuffer();

  // Region-grow the backdrop inward from the border instead of testing every
  // pixel independently, so pink-ish pixels enclosed by the artwork survive.
  const bg = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) stack.push(x, x + (height - 1) * width);
  for (let y = 0; y < height; y++) stack.push(y * width, width - 1 + y * width);

  while (stack.length) {
    const p = stack.pop();
    if (bg[p]) continue;
    const i = p * 4;
    if (!isPink(raw[i], raw[i + 1], raw[i + 2])) continue;
    bg[p] = 1;
    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - width);
    if (y < height - 1) stack.push(p + width);
  }

  if (removeEnclosed) {
    for (let p = 0; p < width * height; p++) {
      if (bg[p]) continue;
      const i = p * 4;
      if (isStrongChroma(raw[i], raw[i + 1], raw[i + 2])) bg[p] = 1;
    }
  }

  for (let p = 0; p < width * height; p++) {
    if (bg[p]) raw[p * 4 + 3] = 0;
  }

  // Anti-aliased edge pixels are a blend of artwork and backdrop, so they sit
  // just under the pink threshold and would survive as a pink halo. Pull the
  // red/blue spill back toward green and fade alpha by how much spill there was.
  for (let p = 0; p < width * height; p++) {
    if (bg[p]) continue;
    const x = p % width;
    const y = (p - x) / width;
    const touchesBg =
      (x > 0 && bg[p - 1]) ||
      (x < width - 1 && bg[p + 1]) ||
      (y > 0 && bg[p - width]) ||
      (y < height - 1 && bg[p + width]);
    if (!touchesBg) continue;

    const i = p * 4;
    const r = raw[i], g = raw[i + 1], b = raw[i + 2];
    const spill = Math.min(r, b) - g;
    if (spill <= 12) continue;
    raw[i] = Math.max(g, r - spill);
    raw[i + 2] = Math.max(g, b - spill);
    raw[i + 3] = Math.max(0, 255 - spill * 2);
  }

  const removed = bg.reduce((a, v) => a + v, 0);
  const pct = Math.round((removed / (width * height)) * 100);

  // Banners keep their frame: the subject's placement inside it is part of the
  // composition, so cropping to the artwork would reframe the hero.
  if (!trim) {
    await sharp(raw, { raw: { width, height, channels: 4 } }).png().toFile(outPath);
    return { removed: pct, size: `${width}x${height}` };
  }

  const tmp = `${outPath}.tmp.png`;
  await sharp(raw, { raw: { width, height, channels: 4 } }).png().toFile(tmp);
  const { to } = await trimAlpha(tmp, outPath, pad);
  fs.unlinkSync(tmp);

  return { removed: pct, size: to };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = path.resolve(process.cwd(), process.argv[2] ?? ".");
  const only = process.argv.slice(3);
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("raw-") && f.endsWith(".png"))
    .filter((f) => !only.length || only.includes(f.replace(/^raw-|\.png$/g, "")));

  for (const f of files) {
    const n = f.replace(/^raw-|\.png$/g, "");
    const outPath = path.join(dir, `inuslots-dark-${n}.png`);
    const { removed, size } = await knockoutChroma(path.join(dir, f), outPath);
    console.log(`${f}: ${removed}% backdrop removed -> ${path.relative(process.cwd(), outPath)} (${size})`);
  }
}
