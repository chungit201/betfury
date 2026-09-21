// Regenerates the hero banner: InuSlots shiba in place of the InuSlots raccoon,
// blue brand lighting, and a transparent background.
//
// The site's hero gradient is blue now, so the captured banner's black matte
// reads as a black box sitting on blue — the banner has to ship with real alpha.
//
// A magenta chroma backdrop was tried first and failed: this is a cinematic 3D
// render, so the backdrop bounced onto the woman's skin and hair, and a key
// loose enough to catch the backdrop flood-filled straight through her. Black is
// the only backdrop that contributes no light, so it stays separable — see
// unmatte-black.mjs for the inverse.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { unmatteBlack } from "./unmatte-black.mjs";

const envPath = path.join(process.cwd(), ".env");
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const match = envContent.match(/^\s*GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?\s*$/m);
const API_KEY = (match?.[1] || process.env.GEMINI_API_KEY || "").trim();
if (!API_KEY) {
  console.error("GEMINI_API_KEY is empty. Put `GEMINI_API_KEY=your_key` in .env and save the file.");
  process.exit(1);
}

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

const BANNER = path.join(process.cwd(), "reference", "inuslots", "hero", "hero-2x.jpeg");
const COIN = path.join(process.cwd(), "reference", "inuslots", "ref-2.jpg");
const bannerB64 = fs.readFileSync(BANNER).toString("base64");
const coinB64 = fs.readFileSync(COIN).toString("base64");

const OUT_DIR = path.join(process.cwd(), "logo-options", "inuslots", "hero");
fs.mkdirSync(OUT_DIR, { recursive: true });

const TARGET = { width: 1080, height: 760 };

const basePrompt = `IMAGE 1 is an existing casino promo banner, to be used as a STYLE and COMPOSITION reference only. IMAGE 2 is the brand mascot.

FROM IMAGE 1, COPY ONLY THE STYLE: glossy high-end 3D character rendering, cinematic rim lighting, subject filling the frame, floating gold coins as set dressing. The SCENE itself is specified at the bottom and is different from IMAGE 1.

FROM IMAGE 2, TAKE THE CHARACTER: a SHIBA INU dog with dark blue-mirrored sunglasses.

ITS FUR COLOUR IS NOT NEGOTIABLE — match IMAGE 2 exactly: the top of the head, the ears and the outside of the face are warm GINGER ORANGE / TAN (roughly #E8A857), and only the muzzle, the eyebrow marks, the cheeks and the chest ruff are pale CREAM. It must read as a ginger shiba inu. It is NOT a white dog, NOT a cream dog, NOT a grey dog, NOT a husky. No dark mask markings around the eyes.

TASK: produce a NEW banner in that style, built around the shiba, for the scene described at the bottom.

ALWAYS:
- The shiba is the hero of the frame: large, front and centre-left, wearing its blue-mirrored sunglasses, pointed ears standing clearly upright so the silhouette reads as a shiba.
- ABSOLUTELY NO RACCOON: no grey or white face, no black eye-mask markings around the eyes, no striped tail, no pointed fox snout. If the face is not ginger-orange with a cream muzzle, it is wrong.
- Any animal emblem printed on an object in the scene is a friendly SHIBA INU head from the front — short blunt muzzle, round cheeks, two small triangular upright ears, small black nose. Never a wolf, fox or raccoon.

COLOUR — this is critical:
- The lighting is ELECTRIC BLUE. Blue rim light down both figures' edges, blue glow bouncing off the ship, cool blue highlights in the hair and on the cap. Deep blue shadows.
- NO red, NO pink, NO magenta, NO orange lighting anywhere on the characters or the ship. The only warm colour permitted is the gold of the VIP ticket and the coins.

BACKGROUND — this is critical:
- The entire background is PURE BLACK (#000000), edge to edge, completely uniform, with no gradient, no vignette, no coloured haze, no border and no frame.
- The black must be true black with nothing rendered on it, because it is cut away afterwards. Do not light the background. Do not let any glow bleed into the far corners.

FORBIDDEN: any text or lettering other than the word "VIP" on the gold ticket. No logos, no watermarks, no captions.`;

// One scene per hero slide. Scene 1 is the cruise banner already installed;
// the rest exist so the slider has somewhere to go.
const variations = [
  'SCENE — FURY CRUISE: the shiba as a ship\'s captain on the left (white naval cap with gold anchor badge, white uniform with gold trim, black gloves) holding up a large gold "VIP" ticket, with a glamorous blonde woman in a navy top holding a wine glass on the right. A cruise-ship prow behind on the left, a palm leaf upper right. Electric-blue rim light.',
  "SCENE — WELCOME BONUS: the shiba alone, centre frame, in a dark navy hoodie, arms spread wide behind an overflowing treasure chest erupting with gold coins and glowing blue gems. Coins tumble toward the camera. Electric-blue glow from inside the chest lighting its face from below.",
  "SCENE — CRYPTO STAKING: the shiba in a sharp dark navy suit jacket, arms folded confidently, surrounded by large floating 3D crypto coins — a gold Bitcoin coin, a silver-blue Ethereum coin — orbiting it against a futuristic blue grid haze. Cool blue key light, crisp white specular highlights on the coins.",
  "SCENE — SLOTS JACKPOT: the shiba leaning out from behind a glowing casino slot machine, one paw on the lever, the reels showing three blazing 7s. Gold coins spray out of the payout tray toward the camera. Intense electric-blue machine glow with warm gold bounce from the coins.",
];

async function callGemini(prompt, useImageConfig) {
  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/jpeg", data: bannerB64 } },
          { inline_data: { mime_type: "image/jpeg", data: coinB64 } },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
      ...(useImageConfig ? { imageConfig: { aspectRatio: "3:2" } } : {}),
    },
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

async function genOne(index, variationText) {
  const prompt = `${basePrompt}\n\n${variationText}`;

  let { res, json } = await callGemini(prompt, true);
  if (!res.ok && res.status === 400) {
    ({ res, json } = await callGemini(prompt, false));
  }

  if (!res.ok) {
    console.error(`Option ${index}: HTTP ${res.status} ${JSON.stringify(json).slice(0, 600)}`);
    return false;
  }

  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) {
    const reason = json?.candidates?.[0]?.finishReason || "unknown";
    console.error(`Option ${index}: no image returned (finishReason=${reason}).`);
    return false;
  }

  const data = Buffer.from(imgPart.inlineData?.data || imgPart.inline_data?.data, "base64");
  const rawPath = path.join(OUT_DIR, `raw-${index}.png`);
  fs.writeFileSync(rawPath, data);

  const cutPath = path.join(OUT_DIR, `cut-${index}.png`);
  const { opaquePct } = await unmatteBlack(rawPath, cutPath);

  const outPath = path.join(OUT_DIR, `hero-${index}.png`);
  await sharp(cutPath)
    .resize({ ...TARGET, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);
  fs.unlinkSync(cutPath);

  console.log(`Option ${index}: ${opaquePct}% solid pixels -> ${path.relative(process.cwd(), outPath)}`);
  return true;
}

const only = process.argv.slice(2).map(Number).filter((n) => n >= 1 && n <= variations.length);
const targets = only.length ? only : variations.map((_, i) => i + 1);

const results = await Promise.all(targets.map((n) => genOne(n, variations[n - 1])));
console.log(`\nDone: ${results.filter(Boolean).length}/${targets.length} options in ${path.relative(process.cwd(), OUT_DIR)}`);
