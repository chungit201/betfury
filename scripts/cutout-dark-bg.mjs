// Cuts a solid object off a black backdrop, keeping its colours intact.
//
// unmatte-black.mjs is the right tool for artwork that is *lit* against black —
// glows, rim light, translucent edges — because it solves `out = alpha * colour`
// and lets dark pixels come back semi-transparent. That is wrong for a solid
// object like a coin: its navy body is genuinely opaque, and dividing it by a
// small alpha washes it out to pale blue, which then looks broken on a light
// background.
//
// Here the backdrop is found by flooding inward from the border over near-black
// pixels and everything else is left fully opaque at its original colour. Only
// the boundary ramp is softened, so the cutout antialiases instead of showing a
// hard jagged rim.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { despeckleAlpha } from "./despeckle.mjs";

// Anything at or below this is backdrop; the coin's darkest rendered pixels and
// its outer glow both sit well above it.
const BG_LEVEL = 45;
// Boundary pixels below this get proportional alpha so the edge fades.
const EDGE_LEVEL = 110;

/**
 * `removeEnclosed` also clears near-black pixels the border flood cannot reach
 * — the hole inside a padlock's shackle, for instance. Only safe when the
 * subject contains no genuinely black areas of its own, so it is opt-in: on a
 * coin with dark sunglasses it would punch holes straight through the lenses.
 */
export async function cutoutDarkBg(srcPath, outPath, { bgLevel = BG_LEVEL, removeEnclosed = false, minBlobFraction = 0.0015 } = {}) {
  const img = sharp(srcPath).ensureAlpha();
  const { width, height } = await img.metadata();
  const raw = await img.raw().toBuffer();

  const level = (i) => Math.max(raw[i], raw[i + 1], raw[i + 2]);

  const bg = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) stack.push(x, x + (height - 1) * width);
  for (let y = 0; y < height; y++) stack.push(y * width, width - 1 + y * width);

  while (stack.length) {
    const p = stack.pop();
    if (bg[p]) continue;
    if (level(p * 4) > bgLevel) continue;
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
      if (!bg[p] && level(p * 4) <= bgLevel) bg[p] = 1;
    }
  }

  let kept = 0;
  for (let p = 0; p < width * height; p++) {
    const i = p * 4;
    if (bg[p]) {
      raw[i] = raw[i + 1] = raw[i + 2] = raw[i + 3] = 0;
      continue;
    }
    const x = p % width;
    const y = (p - x) / width;
    const touchesBg =
      (x > 0 && bg[p - 1]) ||
      (x < width - 1 && bg[p + 1]) ||
      (y > 0 && bg[p - width]) ||
      (y < height - 1 && bg[p + width]);

    const l = level(i);
    raw[i + 3] = touchesBg && l < EDGE_LEVEL ? Math.round((l / EDGE_LEVEL) * 255) : 255;
    kept++;
  }

  const speckled = despeckleAlpha(raw, width, height, minBlobFraction);

  await sharp(raw, { raw: { width, height, channels: 4 } }).png().toFile(outPath);
  return { width, height, keptPct: Math.round((kept / (width * height)) * 100), speckled };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const src = path.resolve(process.cwd(), process.argv[2]);
  const out = process.argv[3] ? path.resolve(process.cwd(), process.argv[3]) : src.replace(/\.png$/, ".cutout.png");
  const { width, height, keptPct } = await cutoutDarkBg(src, out);
  console.log(`${path.basename(src)}: ${width}x${height}, ${keptPct}% kept -> ${path.relative(process.cwd(), out)}`);
  if (!fs.existsSync(out)) process.exitCode = 1;
}
