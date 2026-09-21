// Drives the running page through the Chrome DevTools Protocol to prove the
// carousel arrows actually move each row.
//
// A screenshot cannot show this: the arrows looked identical before and after
// the fix, because the markup was always there and only the behaviour was
// missing. So this clicks the real button and reads scrollLeft back.
//
// Usage: node scripts/check-sliders.mjs [url]
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const URL_UNDER_TEST = process.argv[2] ?? "http://localhost:3001/";
const PORT = 9333;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = path.join(os.tmpdir(), "chrome-cdp-sliders");

fs.rmSync(profile, { recursive: true, force: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--window-size=1500,1200",
  URL_UNDER_TEST,
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findPage() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page;
    } catch {
      // Chrome is still starting up.
    }
    await sleep(250);
  }
  throw new Error("Chrome did not expose a debuggable page");
}

const page = await findPage();
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
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
  const msg = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (msg.result?.exceptionDetails) {
    throw new Error(msg.result.exceptionDetails.exception?.description ?? "evaluate failed");
  }
  return msg.result?.result?.value;
}

// Wait for hydration rather than guessing: the click handlers only exist once
// React has attached, and a cold dev-server compile can take a while.
let viewports = 0;
for (let i = 0; i < 60; i++) {
  viewports = await evaluate(`document.querySelectorAll('.embla__viewport').length`);
  if (viewports > 0) break;
  await sleep(1000);
}
if (!viewports) {
  const title = await evaluate("document.title");
  const bodyLength = await evaluate("document.body?.innerHTML.length ?? 0");
  throw new Error(`no .embla__viewport found at ${URL_UNDER_TEST} (title=${JSON.stringify(title)}, body=${bodyLength} chars)`);
}
// A beat more so React has bound the arrow handlers.
await sleep(2000);

const report = await evaluate(`(async () => {
  const sections = [...document.querySelectorAll('.section')].filter(s => s.querySelector('.embla__viewport'));
  const out = [];
  for (const section of sections) {
    const name = section.querySelector('.section__title')?.textContent?.trim() ?? '(untitled)';
    const viewport = section.querySelector('.embla__viewport');
    const buttons = section.querySelectorAll('.control-button');
    const overflow = viewport.scrollWidth - viewport.clientWidth;

    const before = viewport.scrollLeft;
    buttons[1]?.click();
    await new Promise(r => setTimeout(r, 900));
    const afterNext = viewport.scrollLeft;

    buttons[0]?.click();
    await new Promise(r => setTimeout(r, 900));
    const afterPrev = viewport.scrollLeft;

    out.push({
      name,
      buttons: buttons.length,
      overflow,
      scrollable: getComputedStyle(viewport).overflowX,
      before,
      afterNext,
      afterPrev,
      prevDisabledAtStart: buttons[0]?.disabled ?? null,
    });
  }
  return out;
})()`);

ws.close();
chrome.kill();

let failures = 0;
for (const row of report) {
  const moved = row.afterNext > row.before;
  const returned = row.afterPrev < row.afterNext;
  const ok = row.buttons === 2 && row.overflow > 0 && row.scrollable === "auto" && moved && returned;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${row.name.padEnd(22)} overflow=${row.overflow}px  next: ${row.before}->${row.afterNext}  prev: ->${row.afterPrev}  prevDisabledAtStart=${row.prevDisabledAtStart}`
  );
}
console.log(`\n${report.length - failures}/${report.length} rows scroll in both directions`);
process.exitCode = failures ? 1 : 0;
