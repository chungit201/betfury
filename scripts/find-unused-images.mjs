// Lists images under public/ that nothing in the app references.
//
// Matching is done on the filename rather than the full path, because paths are
// assembled at runtime in places — heroSlides store a `base` and Hero.tsx
// appends "@2x.webp", so a literal path search would wrongly report those as
// dead and delete artwork that is very much in use.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const SEARCH_DIRS = ["src", "scripts"];
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".ico", ".avif"]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// Everything the app could possibly reference an image from.
const SELF = path.resolve(process.argv[1] ?? "");

const haystack = SEARCH_DIRS.filter((d) => fs.existsSync(path.join(ROOT, d)))
  .flatMap((d) => walk(path.join(ROOT, d)))
  .filter((f) => /\.(tsx?|jsx?|mjs|css|json|md)$/.test(f))
  // This file names example filenames in its own comments, which would make
  // them look referenced. It cannot be part of its own search space.
  .filter((f) => path.resolve(f) !== SELF)
  .map((f) => fs.readFileSync(f, "utf8"))
  .join("\n");

const images = walk(PUBLIC).filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));

const used = [];
const unused = [];

for (const file of images) {
  const name = path.basename(file);
  const stem = name.replace(/\.[^.]+$/, "");
  // Bare stems are only safe to match when they carry a content hash. Without
  // that guard, starter files like next.svg, file.svg and window.svg all look
  // "used" because the words next, file and window appear throughout the code.
  const hashed = /\.[0-9a-f]{8}(@[0-9]+x)?$/.test(stem);
  const density = stem.replace(/@[0-9]+x$/, "");

  const referenced =
    haystack.includes(name) ||
    (hashed && (haystack.includes(stem) || haystack.includes(density)));

  if (referenced) used.push(file);
  else unused.push(file);
}

const kb = (f) => Math.round(fs.statSync(f).size / 1024);
const rel = (f) => path.relative(ROOT, f).replace(/\\/g, "/");

console.log(`${used.length} referenced, ${unused.length} unreferenced\n`);
if (unused.length) {
  console.log("UNREFERENCED:");
  let total = 0;
  for (const f of unused.sort()) {
    total += kb(f);
    console.log(`  ${String(kb(f)).padStart(6)}KB  ${rel(f)}`);
  }
  console.log(`  ${String(total).padStart(6)}KB  total`);
}
