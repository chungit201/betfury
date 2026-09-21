// Downloads the Top Slots thumbnails and lays them out as a numbered contact
// sheet, so the ones carrying the InuSlots raccoon can be identified by eye
// rather than guessed from game names.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { topSlots, inhouseGames } from "../src/data/games-data.ts";

// `node scripts/fetch-slot-previews.mjs originals` for the in-house row.
const SETS = { slots: topSlots, originals: inhouseGames };
const setName = process.argv[2] ?? "slots";
const games = SETS[setName];
if (!games) {
  console.error(`Unknown set "${setName}". Use one of: ${Object.keys(SETS).join(", ")}`);
  process.exit(1);
}

const DIR = path.join(process.cwd(), "reference", "inuslots", setName);
fs.mkdirSync(DIR, { recursive: true });

const CELL = 220;
const COLS = 5;

const cells = [];
for (const [i, game] of games.entries()) {
  const n = String(i + 1).padStart(2, "0");
  const file = path.join(DIR, `${n}.jpeg`);
  if (!fs.existsSync(file)) {
    const res = await fetch(game.image);
    if (!res.ok) {
      console.error(`${n} ${game.name}: HTTP ${res.status}`);
      continue;
    }
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  const { width, height } = await sharp(file).metadata();
  console.log(`${n}  ${width}x${height}  ${game.name}`);
  cells.push(await sharp(file).resize(CELL, CELL, { fit: "contain", background: "#0c172d" }).toBuffer());
}

const rows = Math.ceil(cells.length / COLS);
const sheet = path.join(DIR, "contact-sheet.png");
await sharp({
  create: { width: CELL * COLS, height: CELL * rows, channels: 4, background: "#0c172d" },
})
  .composite(cells.map((input, i) => ({ input, left: (i % COLS) * CELL, top: Math.floor(i / COLS) * CELL })))
  .png()
  .toFile(sheet);

console.log(`\nContact sheet (${COLS} per row, numbered left-to-right): ${path.relative(process.cwd(), sheet)}`);
