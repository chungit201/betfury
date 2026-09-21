// Regenerates the INUSLOTS lockup tuned for the site's dark header (#111923).
// The source option-6 artwork renders "INU" in #152950, which is ~1.2:1 against
// the header background and effectively invisible. Each variation below keeps the
// same composition but moves the wordmark into a value range that reads on dark.
//
// Gemini is asked for a flat magenta backdrop rather than white: the wordmark is
// mostly white here, so a white backdrop would be indistinguishable from the
// letters during the knockout. #FF00FF appears nowhere in the artwork.
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

const SRC = path.join(process.cwd(), "logo-options", "inuslots", "inuslots-6.png");
const srcB64 = fs.readFileSync(SRC).toString("base64");

const OUT_DIR = path.join(process.cwd(), "logo-options", "inuslots", "dark");
fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROMA = { r: 255, g: 0, b: 255 };

const basePrompt = `The attached image is an existing horizontal logo lockup for a crypto casino brand called "INUSLOTS": a flat-vector shiba inu head wearing blue sunglasses and a hoodie on the left, and the heavy condensed italic wordmark "INUSLOTS" on the right with angular lightning-bolt cuts slicing through the letters.

PROBLEM TO FIX: this logo is placed on a very dark navy website header (#111923). The first half of the wordmark, "INU", is currently drawn in a dark navy (#152950) that disappears against that background, and the black outlines around the shiba turn into mud.

TASK: redraw the SAME logo — same composition, same proportions, same mascot pose, same italic letterforms, same lightning-cut treatment — but recolored so every element reads clearly on a near-black dark navy background.

HARD REQUIREMENTS:
- Keep the exact same layout: shiba head bust on the LEFT, wordmark "INUSLOTS" on the RIGHT, both vertically centered, wide horizontal banner framing.
- Spelling must be exactly I-N-U-S-L-O-T-S, one word, all capitals, no extra or missing letters, no tagline, no other text anywhere.
- NO dark navy and NO black in the wordmark. Every letter must be light and high-contrast: white, near-white, or bright electric blue (#3B82F6 / #60A5FA).
- The shiba must stay legible on dark: replace heavy black outlines with a light outline (white or bright blue) or drop the outline entirely and rely on the flat fills. Keep the cream/tan face, the blue sunglasses and the hoodie.
- Flat 2D vector, crisp edges, no gradients, no bevel, no 3D, no drop shadows, no glow.
- BACKGROUND: completely flat solid pure magenta (#FF00FF), edge to edge, with nothing else on it — no white, no gray, no shadow, no border, no frame. The magenta is a chroma-key backdrop that gets removed afterwards, so no part of the logo itself may be magenta or pink.`;

const variations = [
  'Variation 1 (direct fix, closest to the original): "INU" in pure white, "SLOTS" in bright electric blue #3B82F6, lightning cuts left as magenta-free knockouts of the opposite color. Shiba keeps its tan face and navy hoodie but gains a crisp white outline.',
  'Variation 2 (all-white wordmark): the entire word "INUSLOTS" in pure white, with the angular lightning cuts rendered in bright electric blue so the blue reads as an accent slicing through white letters. Shiba outlined in white.',
  'Variation 3 (inverted split): "INU" in bright electric blue #60A5FA and "SLOTS" in pure white. Shiba hoodie brightened to electric blue, outline white.',
  'Variation 4 (monochrome light): shiba and wordmark both drawn entirely in white and two tints of light blue only, no tan and no navy anywhere, maximum contrast against the dark header.',
];

async function callGemini(prompt, useImageConfig) {
  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/png", data: srcB64 } },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
      ...(useImageConfig ? { imageConfig: { aspectRatio: "16:9" } } : {}),
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

// Flood-fills the chroma backdrop from the image border so magenta-adjacent
// interior pixels (if any survived) are kept, then feathers the boundary so the
// cutout doesn't carry a hard pink fringe.
async function knockoutChroma(buffer, outPath) {
  const img = sharp(buffer).ensureAlpha();
  const { width, height } = await img.metadata();
  const raw = await img.raw().toBuffer();

  const isChroma = (i) => {
    const r = raw[i], g = raw[i + 1], b = raw[i + 2];
    return r > 150 && b > 150 && g < 120 && Math.abs(r - b) < 90;
  };

  const visited = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) {
    stack.push(x, x + (height - 1) * width);
  }
  for (let y = 0; y < height; y++) {
    stack.push(y * width, width - 1 + y * width);
  }

  while (stack.length) {
    const p = stack.pop();
    if (visited[p]) continue;
    const i = p * 4;
    if (!isChroma(i)) continue;
    visited[p] = 1;
    raw[i + 3] = 0;
    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - width);
    if (y < height - 1) stack.push(p + width);
  }

  // De-fringe: any still-opaque pixel touching the cutout that is pulling toward
  // magenta gets its green channel restored and its alpha ramped down.
  for (let p = 0; p < width * height; p++) {
    if (visited[p]) continue;
    const x = p % width;
    const y = (p - x) / width;
    const neighbours = [];
    if (x > 0) neighbours.push(p - 1);
    if (x < width - 1) neighbours.push(p + 1);
    if (y > 0) neighbours.push(p - width);
    if (y < height - 1) neighbours.push(p + width);
    if (!neighbours.some((n) => visited[n])) continue;

    const i = p * 4;
    const r = raw[i], g = raw[i + 1], b = raw[i + 2];
    const magenta = Math.min(r, b) - g;
    if (magenta <= 20) continue;
    const grey = Math.round((r + b) / 2);
    raw[i] = grey;
    raw[i + 1] = grey;
    raw[i + 2] = grey;
    raw[i + 3] = Math.max(0, 255 - magenta);
  }

  await sharp(raw, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 1 })
    .png()
    .toFile(outPath);

  const transparent = visited.reduce((a, v) => a + v, 0);
  return Math.round((transparent / (width * height)) * 100);
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
    console.error(`Option ${index}: no image returned. ${JSON.stringify(json).slice(0, 600)}`);
    return false;
  }

  const data = Buffer.from(imgPart.inlineData?.data || imgPart.inline_data?.data, "base64");
  const rawPath = path.join(OUT_DIR, `raw-${index}.png`);
  fs.writeFileSync(rawPath, data);

  const outPath = path.join(OUT_DIR, `inuslots-dark-${index}.png`);
  const pct = await knockoutChroma(data, outPath);
  console.log(`Option ${index}: saved -> ${path.relative(process.cwd(), outPath)} (${pct}% background removed)`);
  return true;
}

const only = process.argv.slice(2).map(Number).filter((n) => n >= 1 && n <= variations.length);
const targets = only.length ? only : variations.map((_, i) => i + 1);

const results = await Promise.all(targets.map((n) => genOne(n, variations[n - 1])));
console.log(`\nDone: ${results.filter(Boolean).length}/${targets.length} options in ${path.relative(process.cwd(), OUT_DIR)}`);
