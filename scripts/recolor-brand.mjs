// Rebrands the captured InuSlots palette from crimson to the electric blue of the
// InuSlots coin.
//
// Rather than mapping a handful of hexes by hand, this rotates the hue of every
// colour that falls inside the brand's crimson band and leaves saturation and
// lightness alone. The captured stylesheet uses ~15 different reds (#ed1d49,
// #df123d, #c4003b, #61001d, gradient stops, blur glows...) whose relative
// lightness encodes hover/pressed/shadow states; rotating hue preserves all of
// those relationships, where a flat find-and-replace would flatten them.
//
// The band deliberately stops short of hue 0: pure reds (#fe4a4a, #cc0000) and
// orange-reds (#ff5f2d, #972400) are error states and third-party coin brand
// colours (Bitcoin orange, BNB yellow), not this brand's accent.
import fs from "node:fs";
import path from "node:path";

// Crimson band, in degrees. #ed1d49 sits at 347.3, the darkest shadow tone
// #680002 at 358.8, the deepest gradient stop #c4003b at 341.9.
const BAND = [333, 360];
const TARGET_HUE = 222; // #ed1d49 -> #1d5ced
const MIN_SATURATION = 0.2; // leave near-greys alone

const TARGETS = [
  "public/styles/betfury-style.css",
  "public/styles/betfury-game.css",
  "src/components/Hero.tsx",
  "src/components/Sidebar.tsx",
  "src/components/IconSprite.tsx",
  // SiteFooter.tsx is intentionally absent: its reds are third-party brand
  // colours (YouTube, Instagram, Reddit, TikTok) and must not be rebranded.
];

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgb.map((v) => Math.round((v + m) * 255));
}

function inBand(h) {
  return h >= BAND[0] && h < BAND[1];
}

// Returns null when the colour should be left untouched.
function rebrand(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b);
  if (!inBand(h) || s < MIN_SATURATION) return null;
  return hslToRgb(TARGET_HUE, s, l);
}

const hex2 = (n) => n.toString(16).padStart(2, "0");

function recolor(text) {
  let changes = 0;

  // #rgb / #rrggbb / #rrggbbaa — the alpha suffix is carried through untouched.
  text = text.replace(/#([0-9a-fA-F]{3,8})\b/g, (match, body) => {
    let r, g, b, suffix = "";
    if (body.length === 3) {
      [r, g, b] = [...body].map((c) => parseInt(c + c, 16));
    } else if (body.length === 6 || body.length === 8) {
      r = parseInt(body.slice(0, 2), 16);
      g = parseInt(body.slice(2, 4), 16);
      b = parseInt(body.slice(4, 6), 16);
      suffix = body.slice(6);
    } else {
      return match;
    }
    const out = rebrand(r, g, b);
    if (!out) return match;
    changes++;
    const hex = `#${hex2(out[0])}${hex2(out[1])}${hex2(out[2])}${suffix}`;
    return body === body.toUpperCase() ? hex.toUpperCase() : hex;
  });

  // rgb()/rgba() with comma or space separators.
  text = text.replace(
    /rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*([,/][^)]*)?\)/g,
    (match, r, g, b, rest) => {
      const out = rebrand(+r, +g, +b);
      if (!out) return match;
      changes++;
      const fn = rest ? "rgba" : "rgb";
      return `${fn}(${out[0]},${out[1]},${out[2]}${rest ?? ""})`;
    }
  );

  return { text, changes };
}

let total = 0;
for (const rel of TARGETS) {
  const abs = path.resolve(process.cwd(), rel);
  if (!fs.existsSync(abs)) {
    console.error(`skip (missing): ${rel}`);
    continue;
  }
  const before = fs.readFileSync(abs, "utf8");
  const { text, changes } = recolor(before);
  if (changes) fs.writeFileSync(abs, text);
  total += changes;
  console.log(`${rel}: ${changes} colour${changes === 1 ? "" : "s"} rebranded`);
}
console.log(`\nTotal: ${total}. Revert with: git checkout -- ${TARGETS.join(" ")}`);
