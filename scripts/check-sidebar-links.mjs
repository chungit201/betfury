// Verifies the sidebar's "Soon" treatment: unbuilt rows reveal a badge on
// hover and swallow their click, while the one live row still navigates.
//
// ::after content and click-swallowing are both invisible to a screenshot,
// so this reads the pseudo-element's computed style and watches location.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3000/";
const PORT = 9337;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = path.join(os.tmpdir(), "chrome-cdp-nav");
fs.rmSync(profile, { recursive: true, force: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--window-size=1400,1100",
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
async function evaluate(expression) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression, awaitPromise: true, returnByValue: true } }));
  const m = await new Promise((res) => pending.set(id, res));
  if (m.result?.exceptionDetails) throw new Error(m.result.exceptionDetails.exception?.description);
  return m.result?.result?.value;
}

for (let i = 0; i < 60; i++) {
  if (await evaluate(`document.querySelector('.left-menu a[href="/about-inus"]') !== null`)) break;
  await sleep(1000);
}
await sleep(2000);

const results = [];

// Every row except the live one should carry a Soon badge.
const badgeAudit = await evaluate(`(() => {
  const links = [...document.querySelectorAll('.left-menu a')];
  const withBadge = links.filter(a => getComputedStyle(a, '::after').content.includes('Soon'));
  const live = document.querySelector('.left-menu a[href="/about-inus"]');
  return {
    total: links.length,
    withBadge: withBadge.length,
    liveHasBadge: getComputedStyle(live, '::after').content.includes('Soon'),
    hiddenByDefault: getComputedStyle(links[0], '::after').opacity === '0',
  };
})()`);

results.push([`${badgeAudit.withBadge}/${badgeAudit.total} rows carry a Soon badge`, badgeAudit.withBadge === badgeAudit.total - 1]);
results.push(["live row has no badge", badgeAudit.liveHasBadge === false]);
results.push(["badge hidden until hover", badgeAudit.hiddenByDefault]);

// Clicking an unbuilt row must not navigate.
const before = await evaluate(`location.pathname`);
await evaluate(`document.querySelector('.left-menu a[href="/promo"]').click()`);
await sleep(700);
results.push(["unbuilt row does not navigate", (await evaluate(`location.pathname`)) === before]);

// The live row still does.
await evaluate(`document.querySelector('.left-menu a[href="/about-inus"]').click()`);
await sleep(2500);
results.push(["INUS Token row navigates", (await evaluate(`location.pathname`)) === "/about-inus"]);

ws.close();
chrome.kill();

let failed = 0;
for (const [name, ok] of results) {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exitCode = failed ? 1 : 0;
