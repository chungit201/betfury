// Screenshots a page before and after clicking something, and reports the
// layout boxes either side of the click.
//
// Needed because a plain headless screenshot can only capture the default
// state — collapsing the sidebar is a click, so the broken layout never shows
// up in a static shot.
//
// Usage: node scripts/shoot-states.mjs <url> <click-selector> <report-selectors> <out-prefix>
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [url, clickSel, reportSel, prefix] = process.argv.slice(2);
if (!url || !clickSel || !prefix) {
  console.error("Usage: node scripts/shoot-states.mjs <url> <click-selector> <report-selectors> <out-prefix>");
  process.exit(1);
}

const PORT = 9335;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = path.join(os.tmpdir(), "chrome-cdp-states");
fs.rmSync(profile, { recursive: true, force: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--window-size=1500,1400",
  url,
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let page;
for (let i = 0; i < 40 && !page; i++) {
  try {
    const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    page = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
  } catch {
    /* still starting */
  }
  if (!page) await sleep(250);
}
if (!page) throw new Error("Chrome did not expose a debuggable page");

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true });
  ws.addEventListener("error", rej, { once: true });
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
function send(method, params = {}) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve) => pending.set(id, resolve));
}
async function evaluate(expression) {
  const msg = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (msg.result?.exceptionDetails) throw new Error(msg.result.exceptionDetails.exception?.description);
  return msg.result?.result?.value;
}

const selectors = (reportSel ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const boxes = () =>
  evaluate(`(() => {
    const out = {};
    for (const sel of ${JSON.stringify(selectors)}) {
      const el = document.querySelector(sel);
      if (!el) { out[sel] = 'missing'; continue; }
      const r = el.getBoundingClientRect();
      out[sel] = Math.round(r.left) + ',' + Math.round(r.top) + '  ' + Math.round(r.width) + 'x' + Math.round(r.height);
    }
    const app = document.querySelector('.app');
    out['--left-panel-width'] = app ? getComputedStyle(app).getPropertyValue('--left-panel-width').trim() : '-';
    out['app class'] = app ? app.className : '-';
    return out;
  })()`);

async function shoot(name) {
  const msg = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${prefix}-${name}.png`, Buffer.from(msg.result.data, "base64"));
}

for (let i = 0; i < 60; i++) {
  if (await evaluate(`document.querySelector(${JSON.stringify(clickSel)}) !== null`)) break;
  await sleep(1000);
}
await sleep(2500);

console.log("before:", await boxes());
await shoot("before");

await evaluate(`document.querySelector(${JSON.stringify(clickSel)}).click()`);
await sleep(1200);

console.log("after :", await boxes());
await shoot("after");

ws.close();
chrome.kill();
console.log(`\nwrote ${prefix}-before.png and ${prefix}-after.png`);
