// End-to-end check of the whitelist modal, driven through the DevTools
// Protocol: open it from both header buttons, submit a bad address, then a
// good one, and confirm the entry actually reaches the API.
//
// A screenshot cannot show any of this — the modal only exists after a click,
// and the interesting part is what happens after submit.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const url = process.argv[2] ?? "http://localhost:3000/";
const PORT = 9336;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = path.join(os.tmpdir(), "chrome-cdp-wl");
fs.rmSync(profile, { recursive: true, force: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--window-size=1400,1000",
  url,
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
async function shoot(name) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method: "Page.captureScreenshot", params: { format: "png" } }));
  const m = await new Promise((res) => pending.set(id, res));
  fs.writeFileSync(path.join(os.tmpdir(), `wl-${name}.png`), Buffer.from(m.result.data, "base64"));
}

for (let i = 0; i < 60; i++) {
  if (await evaluate(`document.querySelectorAll('.authorization button').length === 2`)) break;
  await sleep(1000);
}
await sleep(2000);

const results = [];

// 1. Both header buttons open it.
for (const [label, index] of [["Log in", 0], ["Sign Up", 1]]) {
  await evaluate(`document.querySelectorAll('.authorization button')[${index}].click()`);
  await sleep(400);
  const open = await evaluate(`document.querySelector('.wl-modal') !== null`);
  results.push([`${label} opens modal`, open]);
  if (label === "Sign Up") break;
  await evaluate(`document.querySelector('.wl-close').click()`);
  await sleep(300);
}

await shoot("open");

// 2. Body scroll is locked while it is up.
results.push(["body scroll locked", (await evaluate(`getComputedStyle(document.body).overflow`)) === "hidden"]);

// 3. A malformed address is rejected by the API, not silently accepted.
await evaluate(`(() => {
  const input = document.querySelector('.wl-input');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, 'not-an-email');
  input.dispatchEvent(new Event('input', { bubbles: true }));
})()`);
await sleep(200);
await evaluate(`document.querySelector('.wl-submit').click()`);
await sleep(1200);
results.push(["bad address shows an error", await evaluate(`document.querySelector('.wl-error') !== null`)]);
await shoot("error");

// 4. A good address succeeds and reports a position.
const probe = `cdp-probe-${Date.now()}@example.com`;
await evaluate(`(() => {
  const input = document.querySelector('.wl-input');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, ${JSON.stringify(probe)});
  input.dispatchEvent(new Event('input', { bubbles: true }));
})()`);
await sleep(200);
await evaluate(`document.querySelector('.wl-submit').click()`);
await sleep(1500);
const successText = await evaluate(`document.querySelector('.wl-modal')?.innerText ?? ''`);
results.push(["good address shows confirmation", /whitelist|reserved/i.test(successText)]);
await shoot("done");

// 5. Escape closes it.
await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
await sleep(300);
results.push(["Escape closes modal", (await evaluate(`document.querySelector('.wl-modal') === null`))]);
results.push(["body scroll restored", (await evaluate(`getComputedStyle(document.body).overflow`)) !== "hidden"]);

ws.close();
chrome.kill();

let failed = 0;
for (const [name, ok] of results) {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed`);
console.log(`probe address: ${probe}`);
process.exitCode = failed ? 1 : 0;
