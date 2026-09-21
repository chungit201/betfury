// Regenerates the Top Slots thumbnails that carry the InuSlots raccoon, swapping
// it for the InuSlots shiba and the BETFURY wordmark for INUSLOTS.
//
// Only four of the twenty tiles are affected — the rest are third-party games
// (Endorphina, Hacksaw, Spinomenal...) with no InuSlots branding in them, so
// they are left alone. Targets were picked by eye off the contact sheet that
// fetch-slot-previews.mjs builds, not from the game names.
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

const REF_DIR = path.join(process.cwd(), "reference", "inuslots", "slots");
const OUT_DIR = path.join(process.cwd(), "logo-options", "inuslots", "slots");
fs.mkdirSync(OUT_DIR, { recursive: true });

const coinB64 = fs.readFileSync(path.join(process.cwd(), "reference", "inuslots", "ref-2.jpg")).toString("base64");

// The project's own token coin, used when a tile carries InuSlots's BFG token
// artwork. Rendered onto white because Gemini reads a reference more reliably
// as a flat jpeg than as a PNG whose subject floats on transparency.
const TOKEN_REF = path.join(process.cwd(), "reference", "inuslots", "inus-token.jpeg");
if (!fs.existsSync(TOKEN_REF)) {
  await sharp(path.join(process.cwd(), "reference", "inuslots", "inus-token.png"))
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 95 })
    .toFile(TOKEN_REF);
}
const tokenB64 = fs.readFileSync(TOKEN_REF).toString("base64");

// Cards render at 131x175 CSS px. bfstatic serves these at 175x236, which is
// under the 262x350 a 2x display asks for — hence the softness. Ours go out at
// 2x so they stay crisp on retina.
const TARGET = { width: 350, height: 472 };

const TARGETS = [
  {
    id: "01",
    slug: "sugar-rush",
    scene:
      'A candy-themed slot tile on a pink background with a giant pink lollipop and gumballs. A RACCOON head pokes out at the top right. A black oval badge on the left shows the InuSlots raccoon-head logo next to the word "BETFURY". Below that, the stacked logo "Sugar Rush 1000" in pink and yellow candy lettering.',
    keep: 'The word "Sugar" above "RUSH 1000" in the same candy lettering, and the provider line "PRAGMATIC PLAY" at the very bottom.',
  },
  {
    id: "03",
    slug: "merge-up",
    scene:
      'A slot tile on a bright blue starry background. A RACCOON in a white shirt and dark tie stands centre, arms spread, behind a row of coloured gem tiles. Below it the red-and-white logo "MERGE UP FURY" with a small "MERGE UP 2" strip underneath.',
    // This tile carries a bare "FURY", not "BETFURY", so it takes the short
    // rename. Everything else is spelled out because an earlier pass drifted and
    // rewrote the "MERGE UP 2" strip as "INUSGLOT 2".
    keep:
      'The main logo reads "MERGE UP FURY" on two lines. Replace ONLY the word "FURY" with "INU", so it reads "MERGE UP" above "INU" in the same red-and-white style, same size, same position. The small strip beneath it still reads exactly "MERGE UP 2" — do not change it. The provider line at the very bottom still reads "BGAMING" — do not change it. Do not invent, translate or respell any other lettering.',
  },
  // 06 and 09 are re-fed their own generated output rather than the bfstatic
  // original: the shiba and the INUSLOTS wordmark already came out right, and
  // only the leftover BFG token graphics still need replacing. Asking for one
  // change instead of three keeps the parts that already work.
  // Three from-scratch candidates for the Gates tile; the winner gets copied to
  // 06-gates-of.jpeg and the others deleted before install.
  // Re-issue of the Gates tile, this time keeping the provider line that the
  // first fresh pass wrongly suppressed.
  {
    id: "06",
    slug: "gates-of",
    game: '"Gates of INUSLOTS — Super Scatter", an Ancient-Greek-themed sweet bonanza slot.',
    fresh:
      "Setting: the shiba as a Greek god in a white toga with a gold laurel wreath over its ears, arms raised, a gold gate glowing open behind it on a deep blue starry sky. Gold coins spiral outward from its paws.",
    lettering:
      '1. "Gates of" in flowing gold script.\n2. "INUSLOTS" directly beneath it, large, bold, gold, all capitals, spelled exactly I-N-U-S-L-O-T-S.\n3. "SUPER SCATTER" on a ribbon banner below that, white or gold capitals.',
  },
  // Three from-scratch candidates for the Bonanza tile.
  {
    id: "91",
    slug: "bonanza-a",
    game: '"INUSLOTS Bonanza", a sweet candy-themed cascading slot.',
    fresh:
      "Setting: the shiba bursts up through a mountain of glossy candy — pink hearts, purple grapes, green and blue jelly gems — with gold coins spraying into the air around it. Bright candy-pink and violet sky behind.",
    lettering:
      '1. "INUSLOTS" in bold white and gold capitals, spelled exactly I-N-U-S-L-O-T-S.\n2. "BONANZA" directly beneath it, larger, in chunky gold candy lettering.',
  },
  {
    id: "92",
    slug: "bonanza-b",
    game: '"INUSLOTS Bonanza", a sweet candy-themed cascading slot.',
    fresh:
      "Setting: the shiba grinning behind a huge glass candy jar that is overflowing with multicoloured gumballs and gold coins, both paws hugging the jar. Soft pink and lilac background with scattered lollipops.",
    lettering:
      '1. "INUSLOTS" in bold white and gold capitals, spelled exactly I-N-U-S-L-O-T-S.\n2. "BONANZA" directly beneath it, larger, in chunky gold candy lettering.',
  },
  {
    id: "93",
    slug: "bonanza-c",
    game: '"INUSLOTS Bonanza", a sweet candy-themed cascading slot.',
    fresh:
      "Setting: close crop on the shiba's face filling the upper half against a swirling pink and purple candy sky, with a cascade of gold coins and fruit-shaped jelly gems pouring down the lower half of the frame.",
    lettering:
      '1. "INUSLOTS" in bold white and gold capitals, spelled exactly I-N-U-S-L-O-T-S.\n2. "BONANZA" directly beneath it, larger, in chunky gold candy lettering.',
  },
  {
    id: "96",
    slug: "gates-of-legacy",
    source: "generated",
    token: true,
    scene:
      'A slot tile on a pink and lilac background scattered with small round blue token chips. A shiba inu face fills the upper half. Across the middle sits the logo "Gates of INUSLOTS" in gold script over a blue banner reading "SUPER SCATTER".',
    // Gemini ignored the chips on the first attempt and returned the tile
    // unchanged, so the instruction leads with them and states the count.
    keep:
      'THE ONE CHANGE YOU MUST MAKE: there are roughly six small round BLUE token chips scattered across the background, at the left edge, the right edge and the bottom corners. Every one of them must become the GOLD coin from IMAGE 3 — gold body, milled rim, shiba face. Not one blue chip may remain anywhere in the image; if you return the blue chips unchanged the result is wrong. Everything else stays exactly as it is: the big shiba, the gold script "Gates of", the word "INUSLOTS", the blue "SUPER SCATTER" banner, the pink and lilac background, and the provider line "PRAGMATIC PLAY".',
  },
  {
    id: "09",
    slug: "bonanza",
    source: "generated",
    token: true,
    scene:
      'A slot tile on a candy background of pink and purple fruit-shaped gems. A round white-and-red badge in the centre carries a shiba head. Below it the stacked logo "INUSLOTS BONANZA" in white and gold.',
    keep: 'The background gems, the words "INUSLOTS" and "BONANZA", and the provider line "PRAGMATIC PLAY" all stay exactly as they are. The ONLY change is the round centre badge, which becomes the gold coin.',
  },
];

const TOKEN_RULE = `

SUBSTITUTION 3 — THE TOKEN: IMAGE 3 is this brand's own crypto token: a polished GOLD coin with a milled edge, the ginger shiba's face in blue-mirrored sunglasses on its face, and the ticker "INUS" beneath the face. Every token graphic already in the tile — the round centre badge and the small scattered chips — becomes THIS gold coin. Same position, same size, same count, same rotation as the graphics it replaces. The coin is GOLD, not blue and not white. No lettering other than "INUS" may appear on it, and where a chip is too small to carry lettering, just show the gold face and the shiba.`;

// Drawn from scratch rather than edited from the installed tile. That tile had
// been through three img2img passes — shiba swap, then two token swaps — and
// each round trip resoftens the art and re-encodes the jpeg, so it had gone
// visibly mushy. Starting over is the only way back to a crisp tile.
function buildFreshPrompt({ game, fresh, lettering }) {
  return `IMAGE 1 is the brand mascot. IMAGE 2 is the brand's crypto token.

Design a casino slot-game thumbnail from scratch, portrait orientation, full-bleed artwork filling the frame edge to edge with no border, no margin and no rounded corners.

THE GAME: ${game}

THE ART:
- ${MASCOT_3D} The shiba is the hero of the tile, rendered as a glossy 3D character, facing the camera.
- Polished GOLD coins with a milled rim and the shiba's face on them — the token from IMAGE 2 — tumbling through the scene as set dressing.
- ${fresh}

THE LETTERING — these pieces of text and nothing else anywhere in the image:
${lettering}
- At the very bottom, small, in plain light grey capitals, the provider line "PRAGMATIC PLAY".
No other words, no numbers, no watermark, no lettering on the coins beyond the ticker.

QUALITY: sharp, crisp, high-detail game-art illustration. Rich saturated colour, clean edges, strong contrast. Not blurry, not soft, not washed out, no depth-of-field blur on the shiba or the lettering.`;
}

const MASCOT_3D = `A SHIBA INU: warm GINGER ORANGE fur on the head and ears, pale CREAM muzzle, cheeks and brow marks, dark inner ears, small black nose, confident closed-mouth smile, and dark blue-mirrored sunglasses. NOT a wolf, NOT a fox, NOT a raccoon — no grey fur, no black eye-mask, no long snout.`;

function buildPrompt({ scene, keep, token }) {
  return `IMAGE 1 is an existing casino slot-game thumbnail. IMAGE 2 is a brand mascot.${token ? " IMAGE 3 is the brand's crypto token coin." : ""}

IMAGE 1 shows: ${scene}

IMAGE 2 is a SHIBA INU dog: warm GINGER ORANGE fur on the head and ears, a pale CREAM muzzle, cheeks and chest, dark inner ears, a small black nose, a confident closed-mouth smile, and dark blue-mirrored sunglasses.

TASK: reproduce IMAGE 1 as closely as you can, with exactly two substitutions.

SUBSTITUTION 1 — THE ANIMAL: every raccoon in the tile, including any raccoon head used inside a logo badge, becomes the SHIBA INU from IMAGE 2. Same pose, same position, same size, same framing. Ginger-orange fur with a cream muzzle, upright pointed ears, blue-mirrored sunglasses. NO grey fur, NO black eye-mask markings, NO striped tail, NO long fox snout.

SUBSTITUTION 2 — THE WORDMARK: rename the brand, keeping the same typeface style, colours, size and position as the word being replaced. Spelling must be perfect.
- "BETFURY" becomes "INUSLOTS", spelled exactly I-N-U-S-L-O-T-S.
- A standalone "FURY" (one not preceded by "BET") becomes "INU", spelled exactly I-N-U.${token ? TOKEN_RULE : ""}

EVERYTHING ELSE IS UNCHANGED: same background, same props, same colour palette, same layout, same lighting, same lettering style. ${keep}

Portrait orientation, full-bleed artwork filling the frame edge to edge with no border, no margin and no rounded corners. Do not add any text that is not described above.`;
}

async function callGemini(prompt, refs, useImageConfig) {
  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          ...refs.map((data) => ({ inline_data: { mime_type: "image/jpeg", data } })),
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
      ...(useImageConfig ? { imageConfig: { aspectRatio: "3:4" } } : {}),
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

async function genOne(target) {
  const refPath =
    target.source === "generated"
      ? path.join(OUT_DIR, `${target.id}-${target.slug}.jpeg`)
      : path.join(REF_DIR, `${target.id}.jpeg`);
  if (!target.fresh && !fs.existsSync(refPath)) {
    console.error(`${target.id}: missing ${path.relative(process.cwd(), refPath)}`);
    return false;
  }
  const refs = target.fresh
    ? [coinB64, tokenB64]
    : [fs.readFileSync(refPath).toString("base64"), coinB64, ...(target.token ? [tokenB64] : [])];
  const prompt = target.fresh ? buildFreshPrompt(target) : buildPrompt(target);

  let { res, json } = await callGemini(prompt, refs, true);
  if (!res.ok && res.status === 400) {
    ({ res, json } = await callGemini(prompt, refs, false));
  }
  if (!res.ok) {
    console.error(`${target.id}: HTTP ${res.status} ${JSON.stringify(json).slice(0, 400)}`);
    return false;
  }

  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData || p.inline_data);
  if (!imgPart) {
    console.error(`${target.id}: no image (finishReason=${json?.candidates?.[0]?.finishReason})`);
    return false;
  }

  const data = Buffer.from(imgPart.inlineData?.data || imgPart.inline_data?.data, "base64");
  fs.writeFileSync(path.join(OUT_DIR, `raw-${target.id}.png`), data);

  // "cover": these tiles are full-bleed art, so matching the 175x236 frame
  // matters more than keeping every generated pixel.
  const outPath = path.join(OUT_DIR, `${target.id}-${target.slug}.jpeg`);
  await sharp(data).resize({ ...TARGET, fit: "cover" }).jpeg({ quality: 92 }).toFile(outPath);
  console.log(`${target.id} ${target.slug}: -> ${path.relative(process.cwd(), outPath)}`);
  return true;
}

const only = process.argv.slice(2);
if (!only.length) {
  console.error("Pass the target ids to generate, e.g. `node scripts/gen-slot-thumbs.mjs 91 92 93`.");
  process.exit(1);
}
const targets = TARGETS.filter((t) => only.includes(t.id));

const results = await Promise.all(targets.map(genOne));
console.log(`\nDone: ${results.filter(Boolean).length}/${targets.length}`);
