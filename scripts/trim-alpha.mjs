// Crops a PNG down to the bounding box of its non-transparent pixels.
// sharp's own .trim() keys off a border colour and leaves a fully transparent
// frame untouched, which left the generated lockups padded out to 16:9.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const ALPHA_THRESHOLD = 8;

export async function trimAlpha(srcPath, outPath = srcPath, pad = 0) {
  const img = sharp(srcPath).ensureAlpha();
  const { width, height } = await img.metadata();
  const raw = await img.raw().toBuffer();

  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (raw[(y * width + x) * 4 + 3] <= ALPHA_THRESHOLD) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) throw new Error(`${path.basename(srcPath)}: image is fully transparent`);

  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const w = Math.min(width - left, maxX - minX + 1 + pad * 2);
  const h = Math.min(height - top, maxY - minY + 1 + pad * 2);

  const buf = await sharp(raw, { raw: { width, height, channels: 4 } })
    .extract({ left, top, width: w, height: h })
    .png()
    .toBuffer();
  fs.writeFileSync(outPath, buf);
  return { from: `${width}x${height}`, to: `${w}x${h}` };
}

// argv[1] is undefined when this module is imported from `node -e`.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const target = path.resolve(process.cwd(), process.argv[2] ?? ".");
  const files = fs.statSync(target).isDirectory()
    ? fs.readdirSync(target).filter((f) => f.endsWith(".png") && !f.startsWith("preview-") && !f.startsWith("raw-")).map((f) => path.join(target, f))
    : [target];
  for (const f of files) {
    const { from, to } = await trimAlpha(f);
    console.log(`${path.relative(process.cwd(), f)}: ${from} -> ${to}`);
  }
}
