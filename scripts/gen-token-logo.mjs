// Generates candidate logos for the project's Web3 token, in two families:
//
//   flat — the structure of InuSlots's BFG token mark (reference/inuslots/
//          bfg-token.svg): a ring notched with lightning bolts, an animal head
//          in a light disc, a heavy italic ticker underneath.
//   3d   — a glossy rendered coin in the vein of the InuSlots coin artwork.
//
// Each family gets a different backdrop because each cuts out differently: flat
// vector art takes a magenta chroma key cleanly, while a glossy 3D coin bounces
// coloured light off a chroma backdrop and has to be shot on black and
// un-multiplied instead. See knockout-chroma.mjs and unmatte-black.mjs.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { knockoutChroma } from "./knockout-chroma.mjs";
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
const bfgB64 = fs.readFileSync(path.join(REF, "bfg-token.jpeg")).toString("base64");
const coinB64 = fs.readFileSync(path.join(REF, "ref-2.jpg")).toString("base64");

const OUT_DIR = path.join(process.cwd(), "logo-options", "inuslots", "token");
fs.mkdirSync(OUT_DIR, { recursive: true });

const SIZE = 1024;
const TICKER = "INUS";
const TICKER_SPELLED = "I-N-U-S";

const MASCOT = `The mascot is a SHIBA INU: warm GINGER ORANGE fur on the head and ears, pale CREAM muzzle, cheeks and brow marks, dark inner ears, small black nose, confident expression, and dark blue-mirrored sunglasses. NOT a wolf, NOT a fox, NOT a raccoon — no grey fur, no black eye-mask, no long snout, no bared fangs.`;

const PALETTE = `Brand palette: electric blue (#1D5BED) and deep navy (#0C172D), with white and a little gold. No red, no pink, no crimson anywhere.`;

const flatBase = `IMAGE 1 is the BFG crypto token logo, to be used as a STRUCTURE reference. IMAGE 2 is the brand mascot.

IMAGE 1's structure: a thick circular ring broken by lightning-bolt notches that make the ring read as two rotating arrows; inside the ring a light circular field; centred on that field an animal head in flat vector art; and beneath the head a short ticker word in heavy italic condensed capitals.

TASK: design a NEW crypto token logo with that same structure for a brand called INUSLOTS.

REQUIREMENTS:
- Flat 2D VECTOR art only: solid fills, clean crisp edges, bold outlines. No gradients, no bevel, no 3D, no drop shadow, no glow, no texture.
- ${MASCOT}
- The ticker beneath the head reads exactly "${TICKER}" — four letters, ${TICKER_SPELLED}, all capitals, heavy condensed italic. Spelling must be perfect: not "INU", not "INUSS", not "IMUS". No other text anywhere. No "BFG", no "BETFURY".
- ${PALETTE}
- Perfectly circular, centred, filling the frame with a small even margin.
- BACKGROUND: flat solid pure magenta (#FF00FF), edge to edge, uniform, no gradient, no shadow. It is a chroma-key backdrop that gets deleted, so nothing in the logo may be magenta or pink.`;

const threeDBase = `IMAGE 1 is the BFG crypto token logo (structure reference). IMAGE 2 is the brand mascot on a coin.

TASK: render a NEW crypto token as a glossy 3D COIN for a brand called INUSLOTS.

REQUIREMENTS:
- A thick circular metal coin seen straight on, with a raised rim, a milled/reeded edge, and the design embossed in relief on its face.
- ${MASCOT}
- The ticker "${TICKER}" — four letters, ${TICKER_SPELLED}, all capitals — is embossed beneath the head in heavy condensed italic. Spelling must be perfect: not "INU", not "INUSS", not "IMUS". No other text. No "BFG", no "BETFURY".
- THE COIN IS GOLD. Polished warm yellow gold — bright honey and amber tones around #F7CE4B, #E9A828 and #C98A14 — with a mirror shine and crisp golden specular highlights. This is the single most important requirement: it must read instantly as a gold coin.
- BRIGHTNESS IS CRITICAL. The coin is a LIGHT, luminous object lit evenly from the front, so the whole face is clearly visible. Deep brown-gold appears ONLY as a thin accent inside the engraved recesses, never as the main body colour. No black areas on the coin, no heavy shadow across the face, no dim or moody lighting.
- NO blue, silver, chrome or navy on the coin itself. Blue may appear only as a soft outer glow around the coin, never on its surface.
- Premium product-render look: clean, crisp, high-key studio lighting.
- BACKGROUND: pure black (#000000), edge to edge, completely uniform, nothing rendered on it, no vignette, no glow reaching the corners, no border. The black is cut away afterwards.`;

const OPTIONS = [
  { id: 1, family: "flat", note: "Ring notched with two lightning bolts exactly like the reference, shiba head three-quarter view, ring in electric blue, inner field white, ticker navy." },
  { id: 2, family: "flat", note: "Ring in deep navy with electric-blue lightning notches, inner field electric blue, shiba head front-facing in cream and ginger with a white outline, ticker white." },
  { id: 3, family: "flat", note: "Ring formed from four angular chevron segments instead of lightning bolts, shiba head in sharp side profile facing right, electric blue on white, ticker navy with a blue angular cut." },
  // Gold, per the two banner coins used as reference. 4-6 are monochrome gold
  // relief like those; 7-8 keep the shiba's own colours on a gold face.
  { id: 4, family: "3d", note: "Straight-on gold coin, thick raised rim, finely milled edge, the shiba head embossed in gold-on-gold relief exactly like a struck coin, ticker in gold relief beneath. Bright even frontal light, mirror-polished." },
  { id: 5, family: "3d", note: "Gold coin tilted slightly in perspective so the milled edge and the coin's thickness are visible, shiba head and ticker in gold relief, strong specular highlight sweeping across the upper face." },
  { id: 6, family: "3d", note: "Gold coin straight on with a soft warm amber glow halo radiating from behind its rim, shiba head in gold relief, deep amber only inside the engraved lines." },
  { id: 7, family: "3d", note: "Gold coin with the shiba head inlaid in its natural ginger and cream colours with blue-mirrored sunglasses, set into a polished gold face, ticker in gold relief." },
  { id: 8, family: "3d", note: "Two-tone coin: bright polished gold body and rim, with a deep navy enamel disc inset at the centre carrying the ginger shiba head; ticker in gold relief on the gold band below." },
];

async function callGemini(prompt, refs) {
  const body = {
    contents: [{ parts: [{ text: prompt }, ...refs.map((data) => ({ inline_data: { mime_type: "image/jpeg", data } }))] }],
    generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "1:1" } },
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

// Cutting out is cheap, generating is not — `--reprocess` re-runs only the
// former against the raws already on disk.
const REPROCESS = process.argv.includes("--reprocess");

async function genOne({ id, family, note }) {
  const rawPath = path.join(OUT_DIR, `raw-${id}.png`);

  if (!REPROCESS) {
    const base = family === "flat" ? flatBase : threeDBase;
    const { res, json } = await callGemini(`${base}\n\nVARIATION: ${note}`, [bfgB64, coinB64]);

    if (!res.ok) {
      console.error(`token-${id}: HTTP ${res.status} ${JSON.stringify(json).slice(0, 300)}`);
      return false;
    }
    const parts = json?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData || p.inline_data);
    if (!imgPart) {
      console.error(`token-${id}: no image (finishReason=${json?.candidates?.[0]?.finishReason})`);
      return false;
    }
    fs.writeFileSync(rawPath, Buffer.from(imgPart.inlineData?.data || imgPart.inline_data?.data, "base64"));
  } else if (!fs.existsSync(rawPath)) {
    console.error(`token-${id}: no raw to reprocess`);
    return false;
  }

  const cutPath = path.join(OUT_DIR, `cut-${id}.png`);
  if (family === "flat") {
    await knockoutChroma(rawPath, cutPath, { trim: true, pad: 4, removeEnclosed: true });
  } else {
    // cutoutDarkBg, not unmatteBlack: a coin is a solid object, so its body must
    // stay fully opaque at its real colour. Un-multiplying the black matte
    // divides those pixels by a small alpha and washes the coin out to pale blue
    // — which is what made the first install look faded on a light background.
    await cutoutDarkBg(rawPath, cutPath);
    await trimAlpha(cutPath, cutPath, 4);
  }

  await sharp(cutPath)
    .resize({ width: SIZE, height: SIZE, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(OUT_DIR, `token-${id}-${family}.png`));
  fs.unlinkSync(cutPath);

  console.log(`token-${id} (${family}): saved`);
  return true;
}

const only = process.argv.slice(2).map(Number).filter(Number.isFinite);
const targets = only.length ? OPTIONS.filter((o) => only.includes(o.id)) : OPTIONS;

const results = await Promise.all(targets.map(genOne));
console.log(`\nDone: ${results.filter(Boolean).length}/${targets.length} in ${path.relative(process.cwd(), OUT_DIR)}`);
