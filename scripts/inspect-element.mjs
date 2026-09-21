// Reads back the computed box of elements on the running page via the Chrome
// DevTools Protocol.
//
// Layout bugs of the "it looks too small" kind are hard to argue about from a
// screenshot — the useful facts are the rendered width, the intrinsic size of
// the image behind it, and which of the two is winning.
//
// Usage: node scripts/inspect-element.mjs <url> <css-selector> [limit]
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [url, selector, limitArg] = process.argv.slice(2);
if (!url || !selector) {
  console.error("Usage: node scripts/inspect-element.mjs <url> <css-selector> [limit]");
  process.exit(1);
}
const limit = Number(limitArg ?? 6);

const PORT = 9334;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = path.join(os.tmpdir(), "chrome-cdp-inspect");
fs.rmSync(profile, { recursive: true, force: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--window-size=1500,1200",
  url,
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let page;
for (let i = 0; i < 40 && !page; i++) {
  try {
    const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    page = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
  } catch {
    // still starting
  }
  if (!page) await sleep(250);
}
if (!page) throw new Error("Chrome did not expose a debuggable page");

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data);
  const resolve = pending.get(msg.id);
  if (resolve) {
    pending.delete(msg.id);
    resolve(msg);
  }
});

async function evaluate(expression) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression, awaitPromise: true, returnByValue: true } }));
  const msg = await new Promise((resolve) => pending.set(id, resolve));
  if (msg.result?.exceptionDetails) throw new Error(msg.result.exceptionDetails.exception?.description);
  return msg.result?.result?.value;
}

for (let i = 0; i < 60; i++) {
  if (await evaluate(`document.querySelector(${JSON.stringify(selector)}) !== null`)) break;
  await sleep(1000);
}
await sleep(1500);

const rows = await evaluate(`(() => {
  const els = [...document.querySelectorAll(${JSON.stringify(selector)})].slice(0, ${limit});
  return els.map(el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      cls: el.className?.toString().slice(0, 40),
      rendered: Math.round(r.width) + 'x' + Math.round(r.height),
      at: Math.round(r.left + scrollX) + ',' + Math.round(r.top + scrollY),
      intrinsic: el.naturalWidth ? el.naturalWidth + 'x' + el.naturalHeight : '-',
      attrs: el.getAttribute('width') ? el.getAttribute('width') + 'x' + el.getAttribute('height') : '-',
      objectFit: cs.objectFit,
      src: (el.currentSrc || el.src || '').split('/').pop(),
    };
  });
})()`);

ws.close();
chrome.kill();

console.log(`${selector} — ${rows.length} element(s)\n`);
for (const r of rows) {
  console.log(`  <${r.tag}> ${r.cls}`);
  console.log(`      rendered=${r.rendered} at page (${r.at})  intrinsic=${r.intrinsic}  width/height attr=${r.attrs}  object-fit=${r.objectFit}`);
  if (r.src) console.log(`      src=${r.src}`);
}
