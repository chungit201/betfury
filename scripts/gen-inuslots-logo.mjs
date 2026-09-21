import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env");
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const match = envContent.match(/^\s*GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?\s*$/m);
const API_KEY = (match?.[1] || process.env.GEMINI_API_KEY || "").trim();
if (!API_KEY) {
  console.error("GEMINI_API_KEY is empty. Put `GEMINI_API_KEY=your_key` in .env and save the file.");
  process.exit(1);
}

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

const REF_DIR = path.join(process.cwd(), "reference", "inuslots");
const STYLE_REF = path.join(REF_DIR, "ref-1.png"); // layout + typography reference (InuSlots lockup)
const MASCOT_REF = path.join(REF_DIR, "ref-2.jpg"); // mascot + palette reference (shiba coin)

const styleB64 = fs.readFileSync(STYLE_REF).toString("base64");
const mascotB64 = fs.readFileSync(MASCOT_REF).toString("base64");

const OUT_DIR = path.join(process.cwd(), "logo-options", "inuslots");
fs.mkdirSync(OUT_DIR, { recursive: true });

const basePrompt = `You are a senior brand identity designer creating a logo for a crypto casino / slots brand called "INUSLOTS".

REFERENCE IMAGE 1 = the LAYOUT + TYPOGRAPHY blueprint to follow. Study it: a horizontal lockup on a plain white background, with a flat 2D vector animal-head icon on the LEFT, generous empty space, and a heavy condensed ITALIC sports/esports wordmark on the RIGHT. The letterforms are geometric, slanted, tightly kerned, with sharp angular notches and diagonal cut accents slicing into some letters. Flat solid colors only, no gradients, no bevel, no 3D, no drop shadows.

REFERENCE IMAGE 2 = the MASCOT + COLOR source. A cool shiba inu dog with a cream/tan face, black sunglasses, and a black hoodie, set against an electric blue and white palette.

TASK: Produce ONE new horizontal logo lockup for "INUSLOTS" that copies the composition and typographic treatment of REFERENCE IMAGE 1 exactly, but substitutes the subject and colors from REFERENCE IMAGE 2.

HARD REQUIREMENTS:
- Icon on the LEFT: the shiba inu mascot from Reference 2, REDRAWN as a FLAT VECTOR head/bust — clean bold outlines, a handful of flat color fills, the same graphic simplicity as Reference 1's wolf head. Keep the sunglasses and the hoodie collar as recognizable traits. Do NOT draw the coin, the circular badge, the city skyline, the stars, or any of Reference 2's background.
- Wordmark on the RIGHT: the single word "INUSLOTS", spelled exactly I-N-U-S-L-O-T-S, one word, all capitals. Heavy condensed italic, slanted, angular cut accents matching Reference 1's lettering. Spelling must be perfect — no extra, missing, or duplicated letters.
- Palette: electric blue and deep navy as the primary brand colors, with white and black accents; the shiba's face may keep its cream/tan tone. Nothing red.
- Pure white background, wide horizontal banner framing, icon and wordmark vertically centered on the same baseline.
- Crisp, print-ready flat vector look. NOT photorealistic, NOT 3D, NO coin, NO circular frame, NO tagline, NO extra text of any kind besides the word INUSLOTS.`;

const variations = [
  "Variation 1: shiba head in three-quarter view facing right toward the wordmark, sunglasses catching a single white highlight streak, hoodie collar in deep navy, wordmark in electric blue.",
  "Variation 2: shiba head front-facing with the hoodie hood pulled up framing the face, icon drawn in two flat tones of blue only, wordmark in deep navy with a thin electric-blue angular cut through the S.",
  "Variation 3: shiba head in sharp side profile with an exaggerated angular pointed ear echoing the wolf ear in Reference 1, electric blue and white only, wordmark solid navy.",
  "Variation 4: minimalist single-color deep navy silhouette icon in the spirit of Reference 1's gray wolf, with only the sunglasses picked out in electric blue; wordmark electric blue.",
  "Variation 5: dynamic version with two or three angular speed/spike shards trailing behind the shiba head, two-tone palette of navy plus electric blue, wordmark white with a bold navy outline.",
  "Variation 6: aggressive esports treatment — shiba head tilted with a confident smirk, bold black outline around every shape, electric blue fills, and the wordmark split so INU is navy and SLOTS is electric blue.",
];

async function callGemini(prompt, useImageConfig) {
  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/png", data: styleB64 } },
          { inline_data: { mime_type: "image/jpeg", data: mascotB64 } },
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

async function genOne(index, variationText) {
  const prompt = `${basePrompt}\n\n${variationText}`;

  let { res, json } = await callGemini(prompt, true);
  if (!res.ok && res.status === 400) {
    // Older endpoints reject imageConfig — retry without it.
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

  const data = imgPart.inlineData?.data || imgPart.inline_data?.data;
  const outPath = path.join(OUT_DIR, `inuslots-${index}.png`);
  fs.writeFileSync(outPath, Buffer.from(data, "base64"));
  console.log(`Option ${index}: saved -> ${path.relative(process.cwd(), outPath)}`);
  return true;
}

const only = process.argv.slice(2).map(Number).filter((n) => n >= 1 && n <= variations.length);
const targets = only.length ? only : variations.map((_, i) => i + 1);

const results = await Promise.all(targets.map((n) => genOne(n, variations[n - 1])));
console.log(`\nDone: ${results.filter(Boolean).length}/${targets.length} options generated in ${path.relative(process.cwd(), OUT_DIR)}`);
