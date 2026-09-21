// Generates the artwork for the INUS token page: the hero coins, the three
// deflation-strategy icons, and the treasury/burn decorations.
//
// Everything is shot on black and cut out, because each asset sits on the
// page's dark background and needs alpha rather than a matte. Which cutter to
// use depends on the subject:
//
//   cutoutDarkBg  — solid objects (the small icons). Keeps their real colour,
//                   which matters at 40px where a washed-out icon reads as a
//                   smudge.
//   unmatteBlack  — anything whose glow, sparkle or flame is part of the art.
//                   Solving `out = alpha * colour` keeps those soft edges
//                   instead of clipping them to a hard silhouette.
//
// Usage: node scripts/gen-token-page.mjs [id ...]
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { cutoutDarkBg } from "./cutout-dark-bg.mjs";
import { unmatteBlack } from "./unmatte-black.mjs";
import { trimAlpha } from "./trim-alpha.mjs";

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
const OUT_DIR = path.join(process.cwd(), "logo-options", "inuslots", "token-page");
fs.mkdirSync(OUT_DIR, { recursive: true });

const tokenB64 = fs.readFileSync(path.join(REF, "inus-token.jpeg")).toString("base64");

const COIN = `The coin is the one in the reference image: a polished GOLD coin with a finely milled rim, a ginger shiba inu's face in blue-mirrored sunglasses embossed on its face, and the ticker "INUS" embossed beneath the face. Gold body, never silver and never blue.`;

const BLACK_BG = `BACKGROUND: pure black (#000000), edge to edge, completely uniform, nothing rendered on it, no vignette, no border, no ground plane and no reflection surface. The black is cut away afterwards.`;

// Backdrops are full-bleed scene art, so they keep their own background and
// skip the cutout entirely — `cut: "none"`.
const SCENE = `A moody night landscape inside a dark blue rocky canyon, jagged cliffs rising on both sides against a deep navy sky, a faint mist on the ground and shafts of bright cyan-blue light beaming upward from glowing cracks in the rock. Cinematic, atmospheric, softly out of focus so it reads as a backdrop. Deep blues and blacks only — no warm colours, no sunset, no stars.`;

const ASSETS = [
  {
    id: "hero-bg",
    ratio: "21:9",
    cut: "none",
    width: 1600,
    prompt: `${SCENE}

The left third of the frame is darker and emptier than the rest, fading almost to black at the left edge, leaving clean space for text to sit over it.

Absolutely no characters, no coins, no objects, no text, no logo and no watermark anywhere — this is an empty backdrop.`,
  },
  {
    id: "get-art",
    ratio: "21:9",
    cut: "none",
    width: 1600,
    prompt: `${SCENE}

Centred slightly right of middle stands a large glossy 3D open treasure box in bright electric blue with a lighter blue lid, glowing softly from inside. Gold crypto coins tumble out of it and float in the air around it, and two blue curved arrows loop around the box.

${COIN}

The left third of the frame stays dark and empty for text. No text, no logo and no watermark anywhere except the "INUS" already embossed on the coins.`,
  },
  {
    id: "use-betting",
    ratio: "1:1",
    cut: "solid",
    width: 160,
    // "in the style of an app icon" made Gemini draw the rounded black tile as
    // well as the subject, which then survived the cutout as a black square.
    prompt: `A single glossy 3D object floating on its own: a pair of white dice resting on two stacked blue-and-white casino chips. Chunky rounded modelling, smooth plastic shading, clean silhouette, readable at small size.

This is the bare object only. Do NOT draw an app-icon tile, a rounded square, a badge, a plate, a card, a frame or any container behind it. Nothing but the dice and chips against the background.

No text, no numbers other than the dice pips.

${BLACK_BG}`,
  },
  {
    id: "use-staking",
    ratio: "1:1",
    cut: "solid",
    width: 160,
    prompt: `A single glossy 3D icon: one gold crypto coin standing upright with a bright green upward arrow curving up behind it.

${COIN}

Chunky rounded app-icon style, smooth plastic shading, clean silhouette, readable at small size. No other text.

${BLACK_BG}`,
  },
  {
    id: "use-trading",
    ratio: "1:1",
    cut: "solid",
    width: 160,
    prompt: `A single glossy 3D icon: two curved arrows forming a circular swap symbol, one bright blue and one bright green, with a small gold coin tucked at the centre.

${COIN}

Chunky rounded app-icon style, smooth plastic shading, clean silhouette, readable at small size. No text.

${BLACK_BG}`,
  },
  {
    id: "tokenomics",
    ratio: "4:3",
    // A coin is a solid object: un-multiplying the black matte washed its gold
    // out to pale orange. The cyan nodes are bright enough to survive a hard cut.
    cut: "solid",
    width: 760,
    prompt: `A premium 3D render for a tokenomics panel.

${COIN}

One large coin stands upright and slightly angled at the centre, resting on a glowing translucent blue hexagonal platform. Thin cyan network lines connect small glowing nodes that fan out behind and beside it, suggesting a blockchain. Two or three small coins float nearby. Cool electric-blue rim light, crisp golden highlights, sharp focus.

${BLACK_BG}

No text anywhere except the "INUS" already embossed on the coins.`,
  },
  {
    id: "hero",
    ratio: "4:3",
    cut: "unmatte",
    width: 900,
    prompt: `A premium 3D product render of crypto coins floating in mid-air.

${COIN}

Two large coins float at the centre, overlapping and tilted at different angles so one shows its face and the other shows its milled edge, with three smaller coins drifting around them. Cool electric-blue light rims every coin and a soft blue glow radiates outward behind them. Crisp golden specular highlights, high contrast, sharp focus throughout.

${BLACK_BG}

No text anywhere except the "INUS" already embossed on the coins.`,
  },
  {
    id: "icon-burn",
    ratio: "1:1",
    cut: "solid",
    width: 160,
    prompt: `A single glossy 3D icon of a burning FLAME, rendered in the chunky rounded style of a modern app icon. Warm orange and yellow with a bright core, smooth plastic shading, clean silhouette, readable at small size. No coin, no text, no numbers.

${BLACK_BG}`,
  },
  {
    id: "icon-lock",
    ratio: "1:1",
    cut: "solid",
    width: 160,
    prompt: `A single glossy 3D icon of a closed PADLOCK, rendered in the chunky rounded style of a modern app icon. Warm gold body with a lighter gold shackle, smooth plastic shading, clean silhouette, readable at small size. No coin, no text, no numbers.

${BLACK_BG}`,
  },
  {
    id: "icon-coinlock",
    ratio: "1:1",
    cut: "solid",
    width: 160,
    prompt: `A single glossy 3D icon: one gold crypto coin standing upright with a small closed padlock resting against its lower right edge.

${COIN}

Chunky rounded app-icon style, smooth plastic shading, clean silhouette, readable at small size. No other text.

${BLACK_BG}`,
  },
  {
    id: "treasury",
    ratio: "1:1",
    cut: "unmatte",
    width: 420,
    prompt: `A small decorative 3D cluster of crypto coins.

${COIN}

One coin stands upright at the centre with three smaller coins arranged around it, surrounded by bright blue four-pointed sparkle glints and a soft blue glow. Light, airy and celebratory.

${BLACK_BG}

No text anywhere except the "INUS" already embossed on the coins.`,
  },
  {
    id: "burn",
    ratio: "4:3",
    cut: "unmatte",
    width: 560,
    prompt: `A small decorative 3D vignette of crypto coins burning.

${COIN}

A loose stack of three or four coins sits at the centre with bright orange and yellow flames licking up around and behind them, warm firelight catching the gold. The flames fade out into darkness at their tips.

${BLACK_BG}

No text anywhere except the "INUS" already embossed on the coins.`,
  },
];

async function callGemini(prompt, aspectRatio) {
  const body = {
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: tokenB64 } }] }],
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

async function genOne(asset) {
  const { res, json } = await callGemini(asset.prompt, asset.ratio);
  if (!res.ok) {
    console.error(`${asset.id}: HTTP ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
    return false;
  }
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) {
    console.error(`${asset.id}: no image (finishReason=${json?.candidates?.[0]?.finishReason})`);
    return false;
  }

  const raw = path.join(OUT_DIR, `raw-${asset.id}.png`);
  fs.writeFileSync(raw, Buffer.from(imgPart.inlineData?.data || imgPart.inline_data?.data, "base64"));

  const out = path.join(OUT_DIR, `${asset.id}.webp`);

  // Backdrops keep their own scene, so there is nothing to cut away.
  if (asset.cut === "none") {
    await sharp(raw).resize({ width: asset.width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
    console.log(`${asset.id}: ok (backdrop)`);
    return true;
  }

  const cut = path.join(OUT_DIR, `cut-${asset.id}.png`);
  if (asset.cut === "solid") {
    await cutoutDarkBg(raw, cut, { removeEnclosed: asset.removeEnclosed });
  } else {
    await unmatteBlack(raw, cut);
  }
  await trimAlpha(cut, cut, 2);

  await sharp(cut)
    .resize({ width: asset.width, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(out);
  fs.unlinkSync(cut);

  console.log(`${asset.id}: ok`);
  return true;
}

const only = process.argv.slice(2);
const targets = only.length ? ASSETS.filter((a) => only.includes(a.id)) : ASSETS;

const results = await Promise.all(targets.map(genOne));
console.log(`\nDone: ${results.filter(Boolean).length}/${targets.length} in ${path.relative(process.cwd(), OUT_DIR)}`);
