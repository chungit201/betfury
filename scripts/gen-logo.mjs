import fs from "node:fs";
import path from "node:path";

const envContent = fs.readFileSync(path.join(process.cwd(), ".env"), "utf8");
const match = envContent.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m);
if (!match) {
  console.error("GEMINI_API_KEY not found in .env");
  process.exit(1);
}
const API_KEY = match[1].trim();

const IMG1 = "C:/Users/Admin/AppData/Local/Temp/claude/D--projects-betfury/c29f1df7-28d4-4212-9898-2a3a0f49c3c5/images/1.png";
const IMG2 = "C:/Users/Admin/AppData/Local/Temp/claude/D--projects-betfury/c29f1df7-28d4-4212-9898-2a3a0f49c3c5/images/2.png";

const img1b64 = fs.readFileSync(IMG1).toString("base64");
const img2b64 = fs.readFileSync(IMG2).toString("base64");

const OUT_DIR = path.join(process.cwd(), "logo-options");
fs.mkdirSync(OUT_DIR, { recursive: true });

const basePrompt = `You are a professional brand/logo designer. I will give you two reference images.

REFERENCE IMAGE 1 shows the LAYOUT AND TYPOGRAPHY STYLE I want to copy: a horizontal logo lockup with a flat, clean vector icon on the left, and a bold, condensed, italicized, angular sports/esports-style wordmark "FURY" on the right, with sharp cut/spike accents on some letters. Background is transparent/white.

REFERENCE IMAGE 2 shows the MASCOT CHARACTER AND COLOR PALETTE I want to use: a cool shiba inu / corgi-like dog character wearing sunglasses and a black hoodie, on a blue metallic coin badge, with a deep blue and white color scheme.

TASK: Design a NEW horizontal logo lockup in the exact composition style of Reference Image 1 (flat vector icon on the left + bold angular italic wordmark "FURY" on the right, transparent background, clean sharp vector line art, NOT photorealistic, NOT a 3D coin), but:
- Redraw the icon as a simplified FLAT VECTOR head/bust portrait of the dog mascot from Reference Image 2 (same dog character: shiba inu face, sunglasses, hoodie), in the same flat clean linework style as Reference Image 1's wolf icon (not the ornate coin/badge style).
- Use the BLUE color palette from Reference Image 2 (deep blue, cyan-blue, white, black accents) as the primary brand colors for both the icon and the wordmark, instead of the red/gray from Reference Image 1.
- Keep the wordmark text as "FURY", bold condensed italic sports-style lettering with sharp angular cut accents, matching Reference Image 1's typography treatment, recolored in the blue palette.
- Clean transparent background, high resolution, crisp vector look suitable for a betting/gaming brand logo.`;

const variations = [
  "Variation 1: dog icon facing right toward the wordmark, sunglasses clearly visible, confident expression, deep blue and cyan gradient accents.",
  "Variation 2: dog icon facing forward (front-facing), hoodie hood up, monochrome deep-blue line art icon with white FURY wordmark outlined in blue.",
  "Variation 3: dog icon in profile with a sharp angular ear/spike shape echoing Reference Image 1's wolf ear, electric blue and white color scheme.",
  "Variation 4: minimalist single-color deep navy blue icon (like Reference Image 1's gray wolf), wordmark in bright cyan-blue with white outline for contrast.",
  "Variation 5: dynamic version with small motion/spike accent lines behind the dog's head (echoing Reference Image 1's energy), two-tone blue (navy + electric blue) palette.",
];

async function genOne(index, variationText) {
  const prompt = `${basePrompt}\n\n${variationText}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/png", data: img1b64 } },
          { inline_data: { mime_type: "image/png", data: img2b64 } },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    console.error(`Option ${index}: HTTP ${res.status}`, JSON.stringify(json).slice(0, 1000));
    return;
  }

  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  const textParts = parts.filter((p) => p.text).map((p) => p.text);

  if (!imgPart) {
    console.error(`Option ${index}: no image returned.`, JSON.stringify(json).slice(0, 1500));
    return;
  }

  const data = imgPart.inlineData?.data || imgPart.inline_data?.data;
  const outPath = path.join(OUT_DIR, `logo-option-${index}.png`);
  fs.writeFileSync(outPath, Buffer.from(data, "base64"));
  console.log(`Option ${index}: saved -> ${outPath}`);
  if (textParts.length) console.log(`Option ${index} notes:`, textParts.join(" "));
}

for (let i = 0; i < variations.length; i++) {
  await genOne(i + 1, variations[i]);
}
