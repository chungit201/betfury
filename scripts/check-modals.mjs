// Checks the two site-wide modals end to end through the DevTools Protocol:
// every auth CTA opens the whitelist, every unbuilt link opens "Coming soon",
// and the one real route still navigates.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3000/";
const PORT = 9339;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = path.join(os.tmpdir(), "chrome-cdp-modals");
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
async function shoot(name) {
  const m = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(os.tmpdir(), `modal-${name}.png`), Buffer.from(m.result.data, "base64"));
}

for (let i = 0; i < 60; i++) {
  if (await evaluate(`document.querySelector('[data-auth-cta]') !== null`)) break;
  await sleep(1000);
}
await sleep(2500);

const results = [];

const ctaCount = await evaluate(`document.querySelectorAll('[data-auth-cta]').length`);
results.push([`${ctaCount} auth CTAs marked on the page`, ctaCount >= 8]);

// Each CTA opens the whitelist.
for (const [label, selector] of [
  ["header Log in", `document.querySelectorAll('.authorization [data-auth-cta]')[0]`],
  ["header Sign Up", `document.querySelectorAll('.authorization [data-auth-cta]')[1]`],
  ["hero Sign in & Join", `document.querySelector('.home__btn[data-auth-cta]')`],
  ["hero wallet button", `document.querySelector('.login-variant__btn[data-auth-cta]')`],
  ["Buy Crypto CTA", `document.querySelector('.buy-crypto-banner [data-auth-cta], .buy-crypto [data-auth-cta], [data-auth-cta].button-3d_md')`],
]) {
  const exists = await evaluate(`${selector} !== null && ${selector} !== undefined`);
  if (!exists) {
    results.push([`${label} found`, false]);
    continue;
  }
  await evaluate(`${selector}.click()`);
  await sleep(400);
  const open = await evaluate(`document.querySelector('.wl-modal') !== null`);
  results.push([`${label} opens whitelist`, open]);
  if (open) {
    await evaluate(`document.querySelector('.wl-close').click()`);
    await sleep(300);
  }
}

// Whitelist copy now leads with the welcome offer.
await evaluate(`document.querySelectorAll('.authorization [data-auth-cta]')[1].click()`);
await sleep(400);
const wlText = await evaluate(`document.querySelector('.wl-modal')?.innerText ?? ''`);
results.push(["whitelist shows the 590% bonus", /590%/.test(wlText) && /225 Free Spins/i.test(wlText)]);
await shoot("whitelist");
await evaluate(`document.querySelector('.wl-close').click()`);
await sleep(300);

// A game tile opens Coming soon rather than navigating.
const beforePath = await evaluate(`location.pathname`);
await evaluate(`document.querySelector('.embla__slide a.card').click()`);
await sleep(600);
results.push(["game tile opens Coming soon", await evaluate(`document.querySelector('.cs-modal') !== null`)]);
results.push(["game tile did not navigate", (await evaluate(`location.pathname`)) === beforePath]);
const csText = await evaluate(`document.querySelector('.cs-modal')?.innerText ?? ''`);
results.push(["Coming soon names the destination", /\/casino\//.test(csText)]);
await shoot("comingsoon");
await evaluate(`document.querySelector('.cs-close').click()`);
await sleep(300);

// Footer links are covered by the same handler.
await evaluate(`document.querySelector('.footer a[href="/casino/slots"]').click()`);
await sleep(600);
results.push(["footer link opens Coming soon", await evaluate(`document.querySelector('.cs-modal') !== null`)]);
await evaluate(`document.querySelector('.cs-ok').click()`);
await sleep(300);

// The one built route still works.
await evaluate(`document.querySelector('.left-menu a[href="/about-inus"]').click()`);
await sleep(2500);
results.push(["INUS Token still navigates", (await evaluate(`location.pathname`)) === "/about-inus"]);

ws.close();
chrome.kill();

let failed = 0;
for (const [name, ok] of results) {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exitCode = failed ? 1 : 0;
