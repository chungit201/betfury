// Copies the regenerated Top Slots tiles into public/ under content-hashed
// names and prints the games-data.ts lines to paste.
//
// webp rather than jpeg: the tiles are opaque full-bleed art, every browser
// that matters decodes webp, and a single URL avoids turning GameSlider's plain
// <img> into a <picture> for four tiles out of twenty.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// `node scripts/install-slot-thumbs.mjs originals [id ...]` for the in-house row.
const SETS = new Set(["slots", "originals", "wins"]);
const setName = SETS.has(process.argv[2]) ? process.argv[2] : "slots";
const args = process.argv.slice(SETS.has(process.argv[2]) ? 3 : 2);

const SRC_DIR = path.join(process.cwd(), "logo-options", "inuslots", setName);
const OUT_DIR = path.join(process.cwd(), "public", "images", setName);
fs.mkdirSync(OUT_DIR, { recursive: true });

const sources = fs.readdirSync(SRC_DIR).filter((f) => /^\d{2}-[a-z-]+\.jpeg$/.test(f)).sort();
const installed = [];

for (const f of sources) {
  const slug = f.replace(/^\d{2}-|\.jpeg$/g, "");
  const src = path.join(SRC_DIR, f);
  const buf = await sharp(src).webp({ quality: 90 }).toBuffer();
  const hash = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 8);
  const name = `${slug}.${hash}.webp`;
  fs.writeFileSync(path.join(OUT_DIR, name), buf);
  installed.push({ slug, name, bytes: buf.length });
}

const keep = new Set(installed.map((i) => i.name));
for (const f of fs.readdirSync(OUT_DIR)) {
  if (!keep.has(f)) fs.unlinkSync(path.join(OUT_DIR, f));
}

console.log("Paste these into topSlots in src/data/games-data.ts:\n");
for (const { slug, name, bytes } of installed) {
  console.log(`  ${slug.padEnd(12)} "image": "/images/${setName}/${name}",   // ${Math.round(bytes / 1024)}KB`);
}
