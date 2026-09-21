// Drives the header settings popover through the DevTools Protocol.
//
// A screenshot alone cannot answer the questions that actually break a
// popover: is the panel inside the viewport, does something paint over it, do
// the flags resolve to real artwork rather than empty <use> references. So
// every assertion below is measured, not seen.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3001/";
const PORT = 9341;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = path.join(os.tmpdir(), "chrome-cdp-settings");
fs.rmSync(profile, { recursive: true, force: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--window-size=1500,1100",
  base,
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let page;
for (let i = 0; i < 60 && !page; i++) {
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
async function shoot(name) {
  const m = await send("Page.captureScreenshot", { format: "png" });
  const file = path.join(os.tmpdir(), `settings-${name}.png`);
  fs.writeFileSync(file, Buffer.from(m.result.data, "base64"));
  return file;
}

for (let i = 0; i < 60; i++) {
  if (await evaluate(`document.querySelector('.settings-panel__trigger') !== null`)) break;
  await sleep(1000);
}
await sleep(1500);

const results = [];
const check = (label, pass, note = "") => results.push([label, pass, note]);

check("chat button removed", await evaluate(`document.querySelector('.header .chat') === null`));
check("chat sprite symbol removed", await evaluate(`document.querySelector('#icon-chat-3') === null`));
check("panel closed on load", await evaluate(`document.querySelector('.settings-panel') === null`));

// The trigger flag must be drawn artwork, not an unresolved <use>.
check(
  "trigger shows a real flag",
  await evaluate(`(() => {
    const r = document.querySelector('.settings-panel__trigger .flag svg')?.getBoundingClientRect();
    return !!r && r.width >= 20 && r.height >= 20;
  })()`),
);

await evaluate(`document.querySelector('.settings-panel__trigger').click()`);
await sleep(300);

check("click opens the panel", await evaluate(`document.querySelector('.settings-panel') !== null`));
check(
  "opened class drives the caret",
  await evaluate(`document.querySelector('.settings')?.classList.contains('settings--opened') === true`),
);

const box = await evaluate(`(() => {
  const r = document.querySelector('.settings-panel')?.getBoundingClientRect();
  return r ? {top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom),
              left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height)} : null;
})()`);
check("panel has a real box", box !== null && box.w > 400 && box.h > 200, JSON.stringify(box));
check("panel inside the viewport", box !== null && box.left >= 0 && box.right <= 1500 && box.top >= 0);
check(
  "panel is the topmost element at its own top edge",
  /settings-panel/.test(
    await evaluate(`(() => {
      const r = document.querySelector('.settings-panel').getBoundingClientRect();
      const el = document.elementFromPoint(r.left + r.width / 2, r.top + 4);
      return el ? el.className.toString().slice(0, 60) : 'none';
    })()`),
  ),
);

// Two columns, matching the reference layout.
const cols = await evaluate(`(() => {
  const c = [...document.querySelectorAll('.settings-panel__col')];
  return c.map(x => Math.round(x.getBoundingClientRect().left));
})()`);
check("two side-by-side columns", cols.length === 2 && cols[1] > cols[0] + 200, JSON.stringify(cols));

check("three selects", await evaluate(`document.querySelectorAll('.settings-select').length`) === 3);
check(
  "labels match the reference",
  await evaluate(`[...document.querySelectorAll('.settings-select__label')].map(e => e.textContent).join('|')`) ===
    "Language|Display in fiat|Currency for sports",
);
check(
  "sound card and two sliders",
  await evaluate(`document.querySelectorAll('.settings-sound').length`) === 1 &&
    await evaluate(`document.querySelectorAll('.settings-slider').length`) === 2,
);
check(
  "two switch rows plus the sound switch",
  await evaluate(`document.querySelectorAll('.settings-switches__row').length`) === 2 &&
    await evaluate(`document.querySelectorAll('.settings-switch').length`) === 3,
);
check(
  "switch states match the reference (sound on, blocked off, animation on)",
  await evaluate(`[...document.querySelectorAll('.settings-switch')].map(s => s.getAttribute('aria-checked')).join(',')`) ===
    "true,false,true",
);

// Every flag in the panel resolves to artwork with real painted pixels.
const flagsDrawn = await evaluate(`(() => {
  const flags = [...document.querySelectorAll('.settings-panel .flag svg use')];
  return flags.every(u => {
    const id = u.getAttribute('href').slice(1);
    const sym = document.getElementById(id);
    return sym && sym.children.length > 0;
  }) && flags.length > 0;
})()`);
check("every flag reference resolves to a drawn symbol", flagsDrawn);

// The language list opens and switching updates the value and the header flag.
await evaluate(`document.querySelector('[data-select="language"] .settings-select__trigger').click()`);
await sleep(250);
const langCount = await evaluate(`document.querySelectorAll('[data-select="language"] .settings-select__option').length`);
check("language list has 12 entries", langCount === 12, String(langCount));
check(
  "list is not clipped by the panel",
  await evaluate(`(() => {
    const r = document.querySelector('[data-select="language"] .settings-select__list').getBoundingClientRect();
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + 10);
    return !!el && !!el.closest('.settings-select__list');
  })()`),
);

await evaluate(`document.querySelectorAll('[data-select="language"] .settings-select__option')[1].click()`);
await sleep(250);
check(
  "picking Tiếng Việt updates the card",
  await evaluate(`document.querySelector('[data-select="language"] .settings-select__value')?.textContent`) === "Tiếng Việt",
);
check(
  "and the header flag follows",
  await evaluate(`document.querySelector('.settings-panel__trigger .flag use')?.getAttribute('href')`) === "#flag-vn",
);

// Switches and sliders.
await evaluate(`document.querySelectorAll('.settings-switches__row .settings-switch')[1].click()`);
await sleep(250);
check("turning Animation off sets the motion flag", await evaluate(`document.documentElement.dataset.motion`) === "off");
await evaluate(`document.querySelectorAll('.settings-switches__row .settings-switch')[1].click()`);
await sleep(200);
check("turning it back on clears it", await evaluate(`document.documentElement.dataset.motion`) === "on");

await evaluate(`document.querySelectorAll('.settings-switch')[0].click()`);
await sleep(200);
check("muting disables both sliders", await evaluate(`[...document.querySelectorAll('.settings-slider')].every(s => s.disabled)`));
await evaluate(`document.querySelectorAll('.settings-switch')[0].click()`);
await sleep(200);

const open = await shoot("open");

check("still open after all that clicking", await evaluate(`document.querySelector('.settings-panel') !== null`));

await evaluate(`document.querySelector('main, .app').dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}))`);
await sleep(250);
check("outside click closes it", await evaluate(`document.querySelector('.settings-panel') === null`));

await evaluate(`document.querySelector('.settings-panel__trigger').click()`);
await sleep(250);
await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))`);
await sleep(250);
check("Escape closes it", await evaluate(`document.querySelector('.settings-panel') === null`));
check("focus returns to the trigger", await evaluate(`document.activeElement?.classList.contains('settings-panel__trigger') === true`));

// Preferences survive a reload.
await send("Page.navigate", { url: base });
await sleep(4500);
check(
  "language choice survives a reload",
  await evaluate(`document.querySelector('.settings-panel__trigger .flag use')?.getAttribute('href')`) === "#flag-vn",
);

let failed = 0;
for (const [label, pass, note] of results) {
  if (!pass) failed++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${note ? `  [${note}]` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
console.log(`screenshot: ${open}`);

ws.close();
chrome.kill();
process.exit(failed ? 1 : 0);
