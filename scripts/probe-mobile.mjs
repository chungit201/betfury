// Reports layout facts at a given viewport width, and optionally after a click.
//
// Responsive problems are about boxes, not pixels you can eyeball — the useful
// signal is which elements overflow the viewport and what the sidebar toggle
// actually does at that width.
//
// Usage: node scripts/probe-mobile.mjs <url> <width> [click-selector]
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [url, widthArg, clickSel] = process.argv.slice(2);
const width = Number(widthArg ?? 390);
const PORT = 9340;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = path.join(os.tmpdir(), "chrome-cdp-mobile");
fs.rmSync(profile, { recursive: true, force: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  `--window-size=${width},900`,
  url ?? "http://localhost:3000/",
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

const report = () =>
  evaluate(`(() => {
    const vw = document.documentElement.clientWidth;
    const menu = document.querySelector('.left-menu');
    const cs = menu && getComputedStyle(menu);
    const r = menu && menu.getBoundingClientRect();
    // Only elements that actually widen the page count. Anything inside a
    // deliberate horizontal scroller (a carousel, the bets table) extends past
    // the viewport by design and must not be reported.
    const inScroller = (el) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return true;
      }
      return false;
    };
    const overflowing = [...document.querySelectorAll('body *')]
      .filter(el => {
        const b = el.getBoundingClientRect();
        return b.width > 0 && b.right > vw + 1 && !inScroller(el);
      })
      .slice(0, 6)
      .map(el => (el.className && typeof el.className === 'string' ? el.className.split(' ')[0] : el.tagName) + ' → ' + Math.round(el.getBoundingClientRect().right) + 'px');
    return {
      viewport: vw,
      documentScrollWidth: document.documentElement.scrollWidth,
      sidebar: menu ? \`\${Math.round(r.left)},\${Math.round(r.top)} \${Math.round(r.width)}x\${Math.round(r.height)} display=\${cs.display} visibility=\${cs.visibility} transform=\${cs.transform}\` : 'missing',
      navLinksVisible: [...document.querySelectorAll('.left-menu .navigation__item')].filter(a => a.getBoundingClientRect().width > 0 && a.getBoundingClientRect().right > 0).length,
      appClass: document.querySelector('.app')?.className ?? '-',
      zIndex: (() => {
        const pick = (sel) => { const el = document.querySelector(sel); return el ? getComputedStyle(el).zIndex + ' / pos:' + getComputedStyle(el).position : 'missing'; };
        return { menu: pick('.left-menu'), scrim: pick('.nav-scrim'), header: pick('.header') };
      })(),
      drawerBoxes: (() => {
        const pick = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return 'missing';
          const r = el.getBoundingClientRect();
          const c = getComputedStyle(el);
          return ['top=' + Math.round(r.top), 'h=' + Math.round(r.height), 'padT=' + c.paddingTop, 'marT=' + c.marginTop, 'pos=' + c.position, 'cssTop=' + c.top].join(' ');
        };
        return { menu: pick('.left-menu'), outer: pick('.left-menu__outer'), inner: pick('.left-menu__inner'), logo: pick('.drawer-logo'), tabs: pick('.tabs') };
      })(),
      headerFit: (() => {
        const logo = document.querySelector('.header-logo');
        const auth = document.querySelector('.authorization');
        if (!logo || !auth) return 'missing';
        const l = logo.getBoundingClientRect(), a = auth.getBoundingClientRect();
        return { logoRight: Math.round(l.right), authLeft: Math.round(a.left), authRight: Math.round(a.right), overlap: l.right > a.left };
      })(),
      topmostAtCentre: (() => { const el = document.elementFromPoint(120, 400); return el ? (el.className && typeof el.className === 'string' ? el.className.split(' ')[0] : el.tagName) : 'none'; })(),
      overflowing,
    };
  })()`);

// Chrome will not size a window below ~500px, so the viewport is emulated —
// otherwise a 390px phone can never actually be tested.
await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 2, mobile: true });

for (let i = 0; i < 60; i++) {
  if (await evaluate(`document.querySelector('.left-menu') !== null`)) break;
  await sleep(1000);
}
await sleep(2500);

console.log(`--- ${width}px, initial ---`);
console.log(await report());

if (clickSel) {
  await evaluate(`document.querySelector(${JSON.stringify(clickSel)})?.click()`);
  await sleep(700);
  console.log(`--- after clicking ${clickSel} ---`);
  console.log(await report());
}

const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
fs.writeFileSync(path.join(os.tmpdir(), `mobile-${width}.png`), Buffer.from(shot.result.data, "base64"));

ws.close();
chrome.kill();
console.log(`\nscreenshot: ${path.join(os.tmpdir(), `mobile-${width}.png`)}`);
