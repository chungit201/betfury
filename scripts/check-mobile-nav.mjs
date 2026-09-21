// Mobile navigation checks, driven through the DevTools Protocol at an
// emulated phone viewport: the sidebar drawer, its stacking order, and the
// footer accordions.
//
// Stacking bugs are the reason this exists — the drawer looked open in a
// screenshot while the scrim sat on top of it, swallowing every tap. Only
// elementFromPoint tells you that.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3000/";
const width = Number(process.argv[3] ?? 375);
const PORT = 9341;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = path.join(os.tmpdir(), "chrome-cdp-mnav");
fs.rmSync(profile, { recursive: true, force: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--window-size=600,900",
  base,
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let page;
for (let i = 0; i < 40 && !page; i++) {
  try {
    const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    page = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
  } catch {
    /* starting */
  }
  if (!page) await sleep(250);
}
if (!page) throw new Error("no debuggable page");

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true });
  ws.addEventListener("error", rej, { once: true });
});

let nextId = 1;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  const r = pending.get(m.id);
  if (r) {
    pending.delete(m.id);
    r(m);
  }
});
function send(method, params = {}) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((r) => pending.set(id, r));
}
async function evaluate(expression) {
  const m = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (m.result?.exceptionDetails) throw new Error(m.result.exceptionDetails.exception?.description);
  return m.result?.result?.value;
}

await send("Emulation.setDeviceMetricsOverride", { width, height: 780, deviceScaleFactor: 2, mobile: true });

for (let i = 0; i < 60; i++) {
  if (await evaluate(`document.querySelector('.burger') !== null`)) break;
  await sleep(1000);
}
await sleep(2500);

const results = [];

results.push(["no horizontal page overflow", (await evaluate(`document.documentElement.scrollWidth <= document.documentElement.clientWidth`))]);
results.push([
  "header logo clear of the auth buttons",
  await evaluate(`(() => {
    const l = document.querySelector('.header-logo').getBoundingClientRect();
    const a = document.querySelector('.authorization').getBoundingClientRect();
    return l.right <= a.left && a.right <= document.documentElement.clientWidth + 1;
  })()`),
]);

results.push(["nav links hidden before opening", (await evaluate(`document.querySelector('.left-menu').getBoundingClientRect().right <= 0`))]);

await evaluate(`document.querySelector('.burger').click()`);
await sleep(700);

results.push(["drawer slides in", (await evaluate(`document.querySelector('.left-menu').getBoundingClientRect().left === 0`))]);
results.push(["all nav rows rendered", (await evaluate(`document.querySelectorAll('.left-menu .navigation__item').length`)) >= 10]);

// The bug this file exists for: the drawer must be the top layer, not the scrim.
const topmost = await evaluate(`(() => {
  const row = document.querySelector('.left-menu .navigation__item');
  const r = row.getBoundingClientRect();
  const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return el ? (el.closest('.left-menu') ? 'drawer' : (el.className || el.tagName).toString()) : 'none';
})()`);
results.push([`nav row is tappable (topmost = ${topmost})`, topmost === "drawer"]);

// Tapping a row closes the drawer instead of leaving it over the new page.
await evaluate(`document.querySelector('.left-menu a[href="/promo"]').click()`);
await sleep(600);
results.push(["tapping a row closes the drawer", (await evaluate(`document.querySelector('.app--nav-open') === null`))]);
await evaluate(`document.querySelector('.cs-close')?.click()`);
await sleep(300);

// Footer accordions.
results.push(["footer lists collapsed by default", (await evaluate(`getComputedStyle(document.querySelector('.footer .submenu ul')).display === 'none'`))]);
await evaluate(`document.querySelector('.footer .submenu').click()`);
await sleep(400);
results.push(["tapping a footer heading expands it", (await evaluate(`getComputedStyle(document.querySelector('.footer .submenu ul')).display !== 'none'`))]);
await evaluate(`document.querySelector('.footer .submenu').click()`);
await sleep(400);
results.push(["tapping again collapses it", (await evaluate(`getComputedStyle(document.querySelector('.footer .submenu ul')).display === 'none'`))]);

const shot = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync(path.join(os.tmpdir(), `mnav-${width}.png`), Buffer.from(shot.result.data, "base64"));

ws.close();
chrome.kill();

let failed = 0;
for (const [name, ok] of results) {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed at ${width}px`);
process.exitCode = failed ? 1 : 0;
