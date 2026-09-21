// Turns a black-matted banner into a real transparent PNG.
//
// Chroma-keying this artwork does not work: it is a cinematic 3D render, so a
// coloured backdrop bounces onto the characters' skin and hair, and any key
// tight enough to catch the backdrop also catches them. A black backdrop is the
// one colour that adds nothing to the scene, and it is what the original
// InuSlots banner already used.
//
// Compositing over black gives `out = alpha * colour`. So the inverse is:
//   alpha  = max(r, g, b)      -- the brightest channel bounds the coverage
//   colour = rgb / alpha       -- undo the premultiplication
// which is exact for anything lit against black. Genuinely dark pixels are
// indistinguishable from transparent ones in the source (that information was
// destroyed when it was rendered on black), so they come back semi-transparent;
// over the hero's near-black #0c172d the difference is a slight lift, and the
// result matches what `mix-blend-mode: screen` would produce.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { despeckleAlpha } from "./despeckle.mjs";

// Gemini's "pure black" backdrop is not numerically zero — it carries render
// noise and a faint vignette a few levels above black. Clipping at 6 left that
// veil opaque, so the banner's bounding box showed as a lighter rectangle on
// the hero gradient. Everything at or below FLOOR is dropped outright and the
// remaining alpha is rescaled from FLOOR..255 back to 0..255, which fades the
// noise out smoothly rather than replacing one hard edge with another.
const FLOOR = 22;

export async function unmatteBlack(srcPath, outPath, { minBlobFraction = 0.0015 } = {}) {
  const img = sharp(srcPath).ensureAlpha();
  const { width, height } = await img.metadata();
  const raw = await img.raw().toBuffer();

  let opaque = 0;
  for (let i = 0; i < raw.length; i += 4) {
    const r = raw[i], g = raw[i + 1], b = raw[i + 2];
    const a = Math.max(r, g, b);
    if (a <= FLOOR) {
      raw[i] = raw[i + 1] = raw[i + 2] = raw[i + 3] = 0;
      continue;
    }
    const k = 255 / a;
    raw[i] = Math.min(255, Math.round(r * k));
    raw[i + 1] = Math.min(255, Math.round(g * k));
    raw[i + 2] = Math.min(255, Math.round(b * k));
    raw[i + 3] = Math.round(((a - FLOOR) * 255) / (255 - FLOOR));
    if (raw[i + 3] > 200) opaque++;
  }

  const speckled = despeckleAlpha(raw, width, height, minBlobFraction);

  await sharp(raw, { raw: { width, height, channels: 4 } }).png().toFile(outPath);
  return {
    width,
    height,
    opaquePct: Math.round((opaque / (width * height)) * 100),
    speckled,
  };
}

// argv[1] is undefined when this module is imported from `node -e`.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const target = path.resolve(process.cwd(), process.argv[2] ?? ".");
  const files = fs.statSync(target).isDirectory()
    ? fs.readdirSync(target).filter((f) => f.endsWith(".png")).map((f) => path.join(target, f))
    : [target];
  for (const f of files) {
    const out = f.replace(/\.png$/, ".unmatted.png");
    const { width, height, opaquePct } = await unmatteBlack(f, out);
    console.log(`${path.basename(f)}: ${width}x${height}, ${opaquePct}% solid -> ${path.basename(out)}`);
  }
}
