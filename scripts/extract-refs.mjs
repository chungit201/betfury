import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const TRANSCRIPT = process.argv[2];
const OUT_DIR = path.join(process.cwd(), "reference", "inuslots");
fs.mkdirSync(OUT_DIR, { recursive: true });

const found = [];

function walk(node) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) return node.forEach(walk);
  if (node.type === "image" && node.source?.data) {
    found.push({ media: node.source.media_type || "image/png", data: node.source.data });
    return;
  }
  for (const v of Object.values(node)) walk(v);
}

const rl = readline.createInterface({
  input: fs.createReadStream(TRANSCRIPT),
  crlfDelay: Infinity,
});

for await (const line of rl) {
  if (!line.trim()) continue;
  try {
    walk(JSON.parse(line));
  } catch {}
}

const seen = new Set();
let i = 0;
for (const img of found) {
  const key = img.data.slice(0, 200) + img.data.length;
  if (seen.has(key)) continue;
  seen.add(key);
  i++;
  const ext = img.media.split("/")[1]?.replace("jpeg", "jpg") || "png";
  const out = path.join(OUT_DIR, `ref-${i}.${ext}`);
  fs.writeFileSync(out, Buffer.from(img.data, "base64"));
  console.log(`ref-${i}.${ext}  ${img.media}  ${Math.round(img.data.length * 0.75 / 1024)}KB`);
}
console.log(`total unique images: ${i}`);
