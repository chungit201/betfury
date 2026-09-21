// Regenerates the Recent Top Wins assets.
//
// Two jobs, because the row has two problems:
//
// 1. Game tiles. Three of the ten are games we already redrew (Keno, Coin Flip,
//    Gates of), so those just get re-pointed at the local files — no reason to
//    generate them twice. The other seven are third-party titles with no
//    BetFury branding; they are regenerated only to get them to 2x, since the
//    captured assets are 175x236 and a 131x175 card wants 262x350.
//
// 2. Avatars. sprite-1.png is the BetFury raccoon. Worse, sprite-8.png and
//    sprite-11.png are 2632x188 sprite SHEETS, and RecentWinsSlider renders each
//    avatar as a plain 16x16 <img> — so the whole strip gets squashed into the
//    circle. Generating individual shiba avatars fixes the branding and the bug
//    in one go.
//
// Usage: node scripts/gen-wins.mjs [tiles|avatars]   (default: both)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const envPath = path.join(process.cwd(), ".env");
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const match = envContent.match(/^\s*GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?\s*$/m);
const API_KEY = (match?.[1] || process.env.GEMINI_API_KEY || "").trim();
if (!API_KEY) {
  console.error("GEMINI_API_KEY is empty. Put `GEMINI_API_KEY=your_key` in .env and save the file.");
  process.exit(1);
}

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

const OUT_DIR = path.join(process.cwd(), "logo-options", "inuslots", "wins");
fs.mkdirSync(OUT_DIR, { recursive: true });

const coinB64 = fs.readFileSync(path.join(process.cwd(), "reference", "inuslots", "ref-2.jpg")).toString("base64");

const TILE = { width: 350, height: 472 };
const AVATAR = 128;
const CONCURRENCY = 5;

const MASCOT = `A SHIBA INU: warm GINGER ORANGE fur on the head and ears, pale CREAM muzzle, cheeks and brow marks, dark inner ears, small black nose. NOT a wolf, NOT a fox, NOT a raccoon — no grey fur, no black eye-mask, no long snout.`;

// Third-party titles: kept as themselves, including their own provider line.
// Only the resolution changes, so the row still reads as a mix of studios.
const TILES = [
  { id: "03", slug: "crazy-balls", title: "CRAZY BALLS", provider: "EVOLUTION", art: "a live game-show set in deep red and gold; a smiling female presenter in a red dress stands behind a board of numbered balls, warm stage lighting; the title sits on a gold ribbon banner across the lower third" },
  { id: "04", slug: "clumsy-cowboys", title: "CLUMSY COWBOYS", provider: "BACKSEAT GAMING", art: "a cartoon Wild West scene in dusty orange; a goofy grey bull in a cowboy hat leans on a wooden fence, desert and cacti behind; chunky wooden-plank title lettering" },
  { id: "05", slug: "crazy-time", title: "CRAZY TIME", provider: "EVOLUTION", art: "a bright cyan live-studio set; a female presenter with a microphone stands beside a huge multicoloured segmented money wheel; bold white block title with a thin blue strip beneath reading LIVE" },
  { id: "06", slug: "fruit-party", title: "FRUIT PARTY", provider: "PRAGMATIC PLAY", art: "a vivid lime-green gradient; a big glossy yellow star surrounded by juicy watermelon, grape and plum candies; bubbly multicoloured title lettering" },
  { id: "07", slug: "santas-gifts", title: "SANTA'S GIFTS", provider: "PRAGMATIC PLAY", art: "a snowy night in deep blue and red; a jolly cartoon Santa with a white beard holds a sack of presents, snowflakes falling; gold festive title lettering" },
  { id: "09", slug: "gates-of-olympus", title: "GATES OF OLYMPUS", spell: "O-L-Y-M-P-U-S", provider: "PRAGMATIC PLAY", art: "a stormy violet sky over Mount Olympus; a stern white-bearded Zeus in blue robes raises a lightning bolt; ornate gold title lettering on a laurel banner" },
  { id: "10", slug: "ancient-paws", title: "ANCIENT PAWS", provider: "BULLSHARK GAMES", art: "a jungle temple in warm green and gold; a cheerful cartoon dog in an explorer's hat and neckerchief peers out from between stone ruins; glowing green title lettering" },
];

// Six distinct player avatars so the row does not repeat one face 24 times.
const AVATARS = [
  { id: "a1", note: "wearing dark blue-mirrored sunglasses and a navy hoodie" },
  { id: "a2", note: "wearing a red baseball cap turned backwards, grinning" },
  { id: "a3", note: "wearing round gold-rimmed glasses and a white collared shirt" },
  { id: "a4", note: "wearing a gold crown tilted on its head, looking pleased" },
  { id: "a5", note: "wearing green headphones around its neck, tongue out" },
  { id: "a6", note: "wearing a black beanie and a grey scarf, calm expression" },
];

function tilePrompt({ title, provider, art, spell }) {
  return `Design a casino game tile, portrait orientation, full-bleed artwork filling the frame edge to edge — no border, no white margin, no rounded corners.

THE ART: ${art}

TEXT — exactly two pieces of text, nothing else anywhere in the image:
1. The game name "${title}", set large in the lower third in its own stylised display lettering.${spell ? `  Spell the last word exactly ${spell} — check it letter by letter.` : ""}
2. At the very bottom, small, centred, in plain light grey capitals with wide letter spacing: "${provider}".
No other words, no numbers unless part of the game name, no watermark, no tagline.

QUALITY: sharp, crisp, high-detail game-art illustration, richly saturated, strong contrast, clean edges. Not blurry, not soft, no depth-of-field blur on the lettering.`;
}

function avatarPrompt({ note }) {
  return `Design a small circular user-profile avatar for a gaming site.

${MASCOT}

The avatar shows the shiba's HEAD AND SHOULDERS ONLY, facing the camera, centred, filling the frame. It is ${note}.

Flat modern vector illustration with clean bold outlines and simple solid fills — the kind of mark that stays readable when shrunk to 16 pixels. No fine detail, no texture, no gradients, no drop shadow.

BACKGROUND: a single flat solid colour behind the head, edge to edge, contrasting with the fur.

Square image. No text, no letters, no numbers, no watermark, no border, no frame anywhere.`;
}

async function callGemini(prompt, refs, aspectRatio) {
  const body = {
    contents: [{ parts: [{ text: prompt }, ...refs.map((data) => ({ inline_data: { mime_type: "image/jpeg", data } }))] }],
    generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio } },
  };
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
      body: JSON.stringify(body),
    }
  );
  return { res, json: await res.json() };
}

async function generate(label, prompt, refs, aspectRatio) {
  const { res, json } = await callGemini(prompt, refs, aspectRatio);
  if (!res.ok) {
    console.error(`${label}: HTTP ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
    return null;
  }
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) {
    console.error(`${label}: no image (finishReason=${json?.candidates?.[0]?.finishReason})`);
    return null;
  }
  return Buffer.from(imgPart.inlineData?.data || imgPart.inline_data?.data, "base64");
}

async function genTile(t) {
  const data = await generate(`${t.id} ${t.slug}`, tilePrompt(t), [], "3:4");
  if (!data) return false;
  fs.writeFileSync(path.join(OUT_DIR, `raw-${t.id}.png`), data);
  await sharp(data).resize({ ...TILE, fit: "cover" }).jpeg({ quality: 92 }).toFile(path.join(OUT_DIR, `${t.id}-${t.slug}.jpeg`));
  console.log(`${t.id} ${t.slug}: ok`);
  return true;
}

async function genAvatar(a) {
  const data = await generate(a.id, avatarPrompt(a), [coinB64], "1:1");
  if (!data) return false;
  fs.writeFileSync(path.join(OUT_DIR, `raw-${a.id}.png`), data);
  await sharp(data).resize(AVATAR, AVATAR, { fit: "cover" }).webp({ quality: 92 }).toFile(path.join(OUT_DIR, `avatar-${a.id}.webp`));
  console.log(`avatar ${a.id}: ok`);
  return true;
}

async function runBatched(items, fn) {
  let done = 0;
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const results = await Promise.all(items.slice(i, i + CONCURRENCY).map(fn));
    done += results.filter(Boolean).length;
  }
  return done;
}

const what = process.argv[2] ?? "both";
if (what === "tiles" || what === "both") {
  console.log(`tiles: ${await runBatched(TILES, genTile)}/${TILES.length}`);
}
if (what === "avatars" || what === "both") {
  console.log(`avatars: ${await runBatched(AVATARS, genAvatar)}/${AVATARS.length}`);
}
console.log(`\nOutput in ${path.relative(process.cwd(), OUT_DIR)}`);
