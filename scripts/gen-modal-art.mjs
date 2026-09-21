// Generates the mascot art used inside modals.
//
// Shot on black and cut with cutoutDarkBg rather than un-multiplied: the shiba
// is a solid character, and dividing it by a low alpha washes the ginger fur
// out to pale orange — the same trap the token coin hit.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { cutoutDarkBg } from "./cutout-dark-bg.mjs";
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
const OUT_DIR = path.join(process.cwd(), "logo-options", "inuslots", "modal");
fs.mkdirSync(OUT_DIR, { recursive: true });

const coinB64 = fs.readFileSync(path.join(REF, "ref-2.jpg")).toString("base64");

const ASSETS = [
  {
    id: "coming-soon",
    prompt: `A glossy 3D cartoon mascot character, front facing, head and body down to the hips, standing on nothing.

THE CHARACTER: a SHIBA INU with warm GINGER ORANGE fur on the head, ears and back, a pale CREAM muzzle, chest and paws, dark inner ears, a small black nose and large friendly eyes. NOT a wolf, NOT a fox, NOT a raccoon — no grey fur, no black eye-mask, no long snout.

THE POSE: both arms spread wide and open with palms up in a cheerful "not yet, sorry!" shrug, shoulders raised, mouth open in a small apologetic smile, eyebrows up.

THE OUTFIT: a sporty zip-up team jacket in electric blue with white side panels and a small gold coin emblem on the chest.

Chunky rounded modelling, smooth plastic shading, bright even studio light, crisp clean silhouette, high detail.

BACKGROUND: pure black (#000000), edge to edge, completely uniform, nothing rendered on it, no vignette, no ground plane, no shadow and no reflection. The black is cut away afterwards.

No text, no letters, no numbers, no logo and no watermark anywhere.`,
  },
];

async function genOne(asset) {
  const body = {
    contents: [{ parts: [{ text: asset.prompt }, { inline_data: { mime_type: "image/jpeg", data: coinB64 } }] }],
    generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "1:1" } },
  };
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
    body: JSON.stringify(body),
  });
  const json = await res.json();
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

  const cut = path.join(OUT_DIR, `cut-${asset.id}.png`);
  const { speckled } = await cutoutDarkBg(raw, cut);
  await trimAlpha(cut, cut, 2);
  await sharp(cut).resize({ width: 420, withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(OUT_DIR, `${asset.id}.webp`));
  fs.unlinkSync(cut);

  console.log(`${asset.id}: ok (${speckled}px of specks removed)`);
  return true;
}

const only = process.argv.slice(2);
const targets = only.length ? ASSETS.filter((a) => only.includes(a.id)) : ASSETS;
const results = await Promise.all(targets.map(genOne));
console.log(`\nDone: ${results.filter(Boolean).length}/${targets.length} in ${path.relative(process.cwd(), OUT_DIR)}`);
