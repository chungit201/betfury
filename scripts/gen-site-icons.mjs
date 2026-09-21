// Builds the favicon set and the Open Graph card from assets already in the
// repo.
//
// Composed rather than generated: both carry the wordmark, and a generated
// wordmark risks a misspelling that is invisible at thumbnail size but wrong
// on every share card and browser tab. The existing logo PNG is already right,
// so it is reused verbatim.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT_APP = path.join(process.cwd(), "src", "app");
// The head mark, not the coin: at 16px a coin reduces to a gold disc, while
// the shiba silhouette and its black outline stay recognisable.
const MARK = path.join(process.cwd(), "reference", "inuslots", "mark.png");
const LOGO = path.join(process.cwd(), "public", "images", "inuslots-logo.58e9460a.png");
const BACKDROP = path.join(process.cwd(), "public", "images", "token", "hero-bg.0cd37da5.webp");
const HERO_COINS = path.join(process.cwd(), "public", "images", "token", "hero.46c584a4.webp");

const BRAND_BG = "#0c172d";

// ---------------------------------------------------------------------------
// Favicon / app icons
//
// The source is 224x247, so it is letterboxed into a square rather than
// stretched, with a little padding so it clears a rounded iOS mask.
// ---------------------------------------------------------------------------
async function icon(size, { background = null, pad = 0.06 } = {}) {
  const inner = Math.round(size * (1 - pad * 2));
  const mark = await sharp(MARK).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  const base = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });
  return base
    .composite([{ input: mark, left: Math.round((size - inner) / 2), top: Math.round((size - inner) / 2) }])
    .png()
    .toBuffer();
}

// ICO has no encoder in sharp, so the container is assembled by hand. It is a
// simple format: a header, one directory entry per size, then the PNG payloads.
function buildIco(pngs) {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(count, 4);

  const entries = [];
  let offset = 6 + count * 16;
  for (const { size, data } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width, 0 means 256
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette size
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

async function buildIcons() {
  const sizes = [16, 32, 48];
  const pngs = [];
  for (const size of sizes) pngs.push({ size, data: await icon(size) });
  fs.writeFileSync(path.join(OUT_APP, "favicon.ico"), buildIco(pngs));
  console.log(`favicon.ico       ${sizes.join("/")}px`);

  fs.writeFileSync(path.join(OUT_APP, "icon.png"), await icon(512));
  console.log("icon.png          512x512");

  // Apple masks the icon and composites it on white, so it ships opaque on the
  // brand colour instead of transparent.
  fs.writeFileSync(path.join(OUT_APP, "apple-icon.png"), await icon(180, { background: BRAND_BG, pad: 0.1 }));
  console.log("apple-icon.png    180x180 on brand background");
}

// ---------------------------------------------------------------------------
// Open Graph card, 1200x630 — the size every major platform crops toward.
// ---------------------------------------------------------------------------
async function buildOgImage() {
  const W = 1200;
  const H = 630;

  const backdrop = await sharp(BACKDROP).resize(W, H, { fit: "cover", position: "centre" }).toBuffer();

  // Darkens the left half so the wordmark and tagline stay legible over the
  // canyon, and keeps the right side clear for the coins.
  const scrim = Buffer.from(
    `<svg width="${W}" height="${H}">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
           <stop offset="0%" stop-color="#050a14" stop-opacity="0.93"/>
           <stop offset="55%" stop-color="#050a14" stop-opacity="0.55"/>
           <stop offset="100%" stop-color="#050a14" stop-opacity="0.1"/>
         </linearGradient>
       </defs>
       <rect width="${W}" height="${H}" fill="url(#g)"/>
     </svg>`
  );

  const logo = await sharp(LOGO).resize({ width: 420 }).toBuffer();
  const coins = await sharp(HERO_COINS).resize({ width: 470 }).toBuffer();
  const coinsMeta = await sharp(coins).metadata();

  const tagline = Buffer.from(
    `<svg width="620" height="120">
       <style>
         .t { fill: #ffffff; font-family: Montserrat, Arial, sans-serif; font-size: 34px; font-weight: 700; }
         .s { fill: #a7b5ca; font-family: Montserrat, Arial, sans-serif; font-size: 25px; font-weight: 500; }
       </style>
       <text x="0" y="40" class="t">Crypto Casino &amp; Sportsbook</text>
       <text x="0" y="86" class="s">Originals, slots and sports — settled on Arc</text>
     </svg>`
  );

  await sharp(backdrop)
    .composite([
      { input: scrim, left: 0, top: 0 },
      { input: coins, left: W - coinsMeta.width - 40, top: Math.round((H - coinsMeta.height) / 2) },
      { input: logo, left: 80, top: 230 },
      { input: tagline, left: 80, top: 320 },
    ])
    .jpeg({ quality: 88 })
    .toFile(path.join(OUT_APP, "opengraph-image.jpg"));

  console.log(`opengraph-image.jpg  ${W}x${H}`);
}

for (const file of [MARK, LOGO, BACKDROP, HERO_COINS]) {
  if (!fs.existsSync(file)) throw new Error(`missing source asset: ${path.relative(process.cwd(), file)}`);
}

await buildIcons();
await buildOgImage();
console.log("\nAll written into src/app/ — Next picks these up by filename.");
