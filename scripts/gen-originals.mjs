// Redraws the whole in-house "Originals" row from scratch.
//
// Every captured tile carried "BETFURY" as its provider line, and four of them
// (Heist, Ring, Pharaoh, Wild) featured the BetFury raccoon. Rather than editing
// each one, these are generated fresh at 2x so the row is consistently branded
// and stays crisp on retina — the captured assets are 175x236, under the 262x350
// a 2x display asks of a 131x175 card.
//
// Usage: node scripts/gen-originals.mjs [id ...]      (default: all)
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
const REF = path.join(process.cwd(), "reference", "inuslots");
const OUT_DIR = path.join(process.cwd(), "logo-options", "inuslots", "originals");
fs.mkdirSync(OUT_DIR, { recursive: true });

const coinB64 = fs.readFileSync(path.join(REF, "ref-2.jpg")).toString("base64");
const tokenB64 = fs.readFileSync(path.join(REF, "inus-token.jpeg")).toString("base64");

const TARGET = { width: 350, height: 472 };
// Gemini rate-limits hard on parallel image requests; five at a time is the most
// that completed reliably here.
const CONCURRENCY = 5;

const MASCOT = `A SHIBA INU: warm GINGER ORANGE fur on the head and ears, pale CREAM muzzle, cheeks and brow marks, dark inner ears, small black nose, confident closed-mouth smile, and dark blue-mirrored sunglasses. NOT a wolf, NOT a fox, NOT a raccoon — no grey fur, no black eye-mask, no long snout, no striped tail.`;

// The captured row is visually uniform, and that uniformity is the point: these
// tiles sit side by side, so the brief pins down framing, lighting and the
// provider line rather than leaving them to vary per tile.
function buildPrompt({ title, art, mascot }) {
  return `Design a casino game tile for an in-house game, portrait orientation, full-bleed artwork filling the frame edge to edge — no border, no white margin, no rounded corners, no drop shadow around the frame.

HOUSE STYLE (follow exactly, every tile in this set must match):
- A single glossy 3D game icon floating dead centre in the upper two thirds of the tile, rendered in a polished, plastic, high-gloss videogame style with soft studio lighting and clean highlights.
- Behind it, a smooth vertical colour gradient filling the whole frame, with a few faint darker symbols scattered on it as texture.
- The game's name set large and bold in the lower third, in a chunky rounded 3D display typeface with a thin outline and a subtle drop shadow.
- Across the very bottom, small, centred, in plain light grey capitals with wide letter spacing: "INUSLOTS". This line is a plain flat label, not stylised.

THIS TILE:
- Game name, set exactly as written and spelled: "${title}"
- Background and icon: ${art}
${mascot ? `- ${MASCOT}\n- The shiba is the game icon: ${mascot}\n` : ""}
TEXT RULES: the only words anywhere in the image are "${title}" and "INUSLOTS". No provider name other than INUSLOTS, no "BETFURY", no numbers unless they are part of the game name, no watermark, no extra tagline.

QUALITY: sharp, crisp, high-detail, richly saturated, strong contrast, clean edges. Not blurry, not soft, no depth-of-field blur on the icon or the lettering.`;
}

export const GAMES = [
  { id: "01", slug: "dice", title: "DICE", art: "deep green gradient; icon is a pair of glossy white dice resting on a dark horizontal slider bar with a green fill" },
  { id: "02", slug: "spacedice", title: "SPACE DICE", art: "electric blue gradient with stars; icon is a glowing blue-and-white die tumbling through space with a light trail" },
  { id: "03", slug: "futures", title: "FUTURES", art: "dark slate gradient; icon is a green-and-red candlestick trading chart with a bright green arrow rising steeply through it" },
  { id: "04", slug: "keno", title: "KENO", art: "blue-to-violet gradient; icon is a glossy keno ticket board with numbered balls, a couple of them lit up" },
  { id: "05", slug: "mines", title: "MINES", art: "purple gradient; icon is an open treasure chest spilling gold with a round black bomb, fuse lit, sitting on top" },
  { id: "06", slug: "inuheist", title: "INU HEIST", art: "deep green gradient with faint safe and banknote symbols", mascot: "a burglar shiba in a black flat cap and a striped jumper, holding a bulging money sack over one shoulder, grinning" },
  { id: "07", slug: "litecrash", title: "LITE CRASH", art: "crimson-to-dark-red gradient; icon is a smartphone showing a soaring multiplier curve with a glowing red dot at its peak" },
  { id: "08", slug: "blackjack", title: "BLACK JACK", art: "violet gradient; icon is a fanned hand of playing cards with a gold 21 chip resting in front of them" },
  { id: "09", slug: "limbo", title: "LIMBO", art: "red gradient; icon is a white rocket bursting upward out of a glowing card, leaving a bright trail" },
  { id: "10", slug: "crash", title: "CRASH", art: "warm orange gradient; icon is a white-and-blue rocket climbing past a pale moon on a puff of cloud" },
  { id: "11", slug: "roulette", title: "ROULETTE", art: "purple gradient; icon is a roulette wheel seen at an angle with a small gold crown above it and casino chips at its base" },
  { id: "12", slug: "plinko", title: "PLINKO", art: "deep red gradient; icon is a triangular plinko peg board with a glowing ball dropping through it and flames at its lower corners" },
  { id: "13", slug: "coinflip", title: "COIN FLIP", art: "golden amber gradient; icon is two coins mid-flip, one gold and one silver, crossing each other", mascot: "its face is embossed on the gold coin" },
  { id: "14", slug: "ring", title: "RING", art: "royal blue gradient; icon is a glowing circular ring of rainbow segments", mascot: "its head sits centred inside the ring, looking out at the viewer" },
  { id: "15", slug: "tower", title: "TOWER", art: "blue gradient; icon is a stack of glossy hexagonal blocks with a cartoon wizard and a cartoon devil perched on top of them" },
  { id: "16", slug: "cryptos", title: "CRYPTOS", art: "dark gold gradient; icon is a cluster of glossy coloured hexagon tiles each bearing a crypto symbol, with a Bitcoin coin in front" },
  { id: "17", slug: "inupharaoh", title: "INU PHARAOH", art: "dark sandstone gradient with faint hieroglyph symbols", mascot: "wearing a gold-and-blue striped pharaoh headdress with a cobra at the brow" },
  { id: "18", slug: "stairs", title: "STAIRS", art: "steel blue gradient with a crescent moon; icon is a flight of glowing blue steps climbing to the right with a small figure at the top" },
  { id: "19", slug: "inuwild", title: "INU WILD", art: "red-to-gold gradient with faint card suit symbols", mascot: "dressed as a cowboy in a red neckerchief and waistcoat, arms spread wide" },
  { id: "20", slug: "hilo", title: "HI LO", art: "bright blue gradient; icon is two playing cards side by side, a low card and a high card, with an up arrow and a down arrow between them" },
  { id: "21", slug: "circle", title: "CIRCLE", art: "green gradient; icon is a segmented fortune wheel with multiplier labels around its rim and a pointer at the top" },
  { id: "22", slug: "triple", title: "TRIPLE", art: "orange gradient; icon is three interlocking gold lightning bolts forming a spiral burst" },
];

async function callGemini(prompt, refs) {
  const body = {
    contents: [{ parts: [{ text: prompt }, ...refs.map((data) => ({ inline_data: { mime_type: "image/jpeg", data } }))] }],
    generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "3:4" } },
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

async function genOne(game) {
  const refs = game.mascot ? [coinB64, tokenB64] : [];
  const { res, json } = await callGemini(buildPrompt(game), refs);

  if (!res.ok) {
    console.error(`${game.id} ${game.slug}: HTTP ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
    return false;
  }
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) {
    console.error(`${game.id} ${game.slug}: no image (finishReason=${json?.candidates?.[0]?.finishReason})`);
    return false;
  }

  const data = Buffer.from(imgPart.inlineData?.data || imgPart.inline_data?.data, "base64");
  fs.writeFileSync(path.join(OUT_DIR, `raw-${game.id}.png`), data);
  await sharp(data).resize({ ...TARGET, fit: "cover" }).jpeg({ quality: 92 }).toFile(path.join(OUT_DIR, `${game.id}-${game.slug}.jpeg`));
  console.log(`${game.id} ${game.slug}: ok`);
  return true;
}

const only = process.argv.slice(2);
const targets = only.length ? GAMES.filter((g) => only.includes(g.id)) : GAMES;

let done = 0;
for (let i = 0; i < targets.length; i += CONCURRENCY) {
  const batch = targets.slice(i, i + CONCURRENCY);
  const results = await Promise.all(batch.map(genOne));
  done += results.filter(Boolean).length;
}
console.log(`\nDone: ${done}/${targets.length} in ${path.relative(process.cwd(), OUT_DIR)}`);
