// Installs generated hero banners into public/ as the slider's slide set,
// emitting the @1x/@2x webp+png pair the original banner served.
//
// Usage: node scripts/install-hero-banner.mjs [option-number ...]   (default: all)
//
// Filenames carry a content hash: public/ assets are cached by URL, both by the
// browser and by the /_next/image optimizer, so overwriting a file in place
// leaves stale artwork on screen.
//
// webp + png only. jpeg would flatten the alpha back onto a matte, which is the
// black-box problem the transparent banners exist to fix.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC_DIR = path.join(process.cwd(), "logo-options", "inuslots", "hero");
const OUT_DIR = path.join(process.cwd(), "public", "images", "hero");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Matches the captured banner's dimensions so the hero crops identically.
const SIZES = { "1x": { width: 540, height: 380 }, "2x": { width: 1080, height: 760 } };

const only = process.argv.slice(2).map(Number).filter(Number.isFinite);
const options = (
  only.length
    ? only
    : fs
        .readdirSync(SRC_DIR)
        .filter((f) => /^hero-\d+\.png$/.test(f))
        .map((f) => Number(f.match(/\d+/)[0]))
).sort((a, b) => a - b);

const installed = [];

for (const option of options) {
  const src = path.join(SRC_DIR, `hero-${option}.png`);
  if (!fs.existsSync(src)) {
    console.error(`skip (missing): ${path.relative(process.cwd(), src)}`);
    continue;
  }
  const hash = crypto.createHash("sha256").update(fs.readFileSync(src)).digest("hex").slice(0, 8);
  const base = `slide-${option}.${hash}`;

  for (const [density, size] of Object.entries(SIZES)) {
    const pipeline = () =>
      sharp(src).resize({ ...size, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } });
    await pipeline().webp({ quality: 88, alphaQuality: 100 }).toFile(path.join(OUT_DIR, `${base}@${density}.webp`));
    await pipeline().png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, `${base}@${density}.png`));
  }
  installed.push({ option, base });
  console.log(`option ${option} -> /images/hero/${base}@{1x,2x}.{webp,png}`);
}

// Drop older generations so public/ doesn't accumulate every attempt.
const keep = new Set(installed.map((i) => i.base));
for (const f of fs.readdirSync(OUT_DIR)) {
  const base = f.replace(/@(1x|2x)\.(webp|png)$/, "");
  if (!keep.has(base)) fs.unlinkSync(path.join(OUT_DIR, f));
}

console.log("\nPaste the `base` values into heroSlides in src/data/games-data.ts:");
for (const { option, base } of installed) {
  console.log(`  // option ${option}\n  "base": "/images/hero/${base}",`);
}
