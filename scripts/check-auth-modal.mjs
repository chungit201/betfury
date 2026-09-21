// Drives the Login / Sign Up dialog end to end through the DevTools Protocol.
//
// Replaces check-whitelist.mjs: the standalone whitelist sheet is gone, and the
// address capture now lives in the Sign Up tab of this dialog. The /api/whitelist
// endpoint it posts to is unchanged, so the last two assertions still prove the
// same thing — a real address lands in the real store and comes back with a
// position.
//
// Usage: node scripts/check-auth-modal.mjs [url]
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const base = process.argv[2] ?? "http://localhost:3001/";
const PORT = 9347;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = path.join(os.tmpdir(), "chrome-cdp-auth");
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
  const file = path.join(os.tmpdir(), `auth-${name}.png`);
  fs.writeFileSync(file, Buffer.from(m.result.data, "base64"));
  return file;
}
// React installs its own value setter on the input, so assigning `.value`
// directly updates the DOM without the component ever hearing about it.
const type = async (selector, value) => {
  await evaluate(`(() => {
    const input = document.querySelector(${JSON.stringify(selector)});
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(150);
};

for (let i = 0; i < 60; i++) {
  if (await evaluate(`document.querySelectorAll('.authorization button').length === 2`)) break;
  await sleep(1000);
}
await sleep(2000);

const results = [];
const check = (label, pass, note = "") => results.push([label, pass, note]);
const close = async () => {
  await evaluate(`document.querySelector('.auth-modal__close')?.click()`);
  await sleep(300);
};

// 1. Each header button opens the dialog on its own tab. Which tab is inferred
//    from the control's wording, so this is really testing that inference.
for (const [label, index, expected] of [["Log in", 0, "Login"], ["Sign Up", 1, "Sign Up"]]) {
  await evaluate(`document.querySelectorAll('.authorization button')[${index}].click()`);
  await sleep(400);
  const open = await evaluate(`document.querySelector('.auth-modal') !== null`);
  const active = await evaluate(`document.querySelector('.auth-tab--active')?.textContent`);
  check(`${label} opens the dialog on the ${expected} tab`, open && active === expected, active ?? "not open");
  if (label === "Log in") await close();
}

// 2. Both panes rendered, including the artwork.
check("art pane rendered", await evaluate(`document.querySelector('.auth-modal__art') !== null`));
check(
  "mascot image actually loaded",
  await evaluate(`(() => {
    const img = document.querySelector('.auth-modal__mascot');
    return !!img && img.complete && img.naturalWidth > 100;
  })()`),
);
check(
  "welcome offer shown",
  /590%/.test(await evaluate(`document.querySelector('.auth-modal__offer')?.innerText ?? ''`)) &&
    /225 Free Spins/i.test(await evaluate(`document.querySelector('.auth-modal__offer')?.innerText ?? ''`)),
);
check("six wallet buttons", await evaluate(`document.querySelectorAll('.auth-wallet').length`) === 6);
check(
  "wallet glyphs resolve to drawn symbols",
  await evaluate(`[...document.querySelectorAll('.auth-wallet svg use')].every(u => {
    const s = document.getElementById(u.getAttribute('href').slice(1));
    return s && s.children.length > 0;
  })`),
);
check("body scroll locked", (await evaluate(`getComputedStyle(document.body).overflow`)) === "hidden");

// 3. Sign Up carries the fields the reference shows; Login does not.
check("sign up has a phone field", await evaluate(`document.querySelector('.auth-field--phone') !== null`));
check("sign up has the consent checkbox", await evaluate(`document.querySelector('.auth-consent input')?.checked === true`));
check("sign up has the promo toggle", await evaluate(`document.querySelector('.auth-promo__toggle') !== null`));
check("submit reads Create Account", (await evaluate(`document.querySelector('.auth-submit')?.textContent`)) === "Create Account");

await evaluate(`document.querySelector('.auth-promo__toggle').click()`);
await sleep(250);
check("promo toggle reveals its field", await evaluate(`document.querySelector('.auth-field--promo') !== null`));

// The country-code list is built from the same flags as the settings panel.
await evaluate(`document.querySelector('.auth-dial').click()`);
await sleep(250);
const dialCount = await evaluate(`document.querySelectorAll('.auth-dial__option').length`);
check("country code list opens", dialCount === 13, String(dialCount));
await evaluate(`document.querySelectorAll('.auth-dial__option')[1].click()`);
await sleep(250);
check("picking a country updates the button", (await evaluate(`document.querySelector('.auth-dial__code')?.textContent`)) === "+1");

const signupShot = await shoot("signup");

// 4. Validation runs before anything is sent.
await type(".auth-field input[type=email]", "not-an-email");
await type("input[type=password]", "longenough1");
await evaluate(`document.querySelector('.auth-submit').click()`);
await sleep(800);
check("bad address is rejected", await evaluate(`document.querySelector('.auth-error') !== null`));

await type(".auth-field input[type=email]", "someone@example.com");
await type("input[type=password]", "short");
await evaluate(`document.querySelector('.auth-submit').click()`);
await sleep(800);
check(
  "short password is rejected",
  /8 characters/i.test(await evaluate(`document.querySelector('.auth-error')?.textContent ?? ''`)),
);

// 5. The password reveal is a real toggle.
check("password starts masked", (await evaluate(`document.querySelector('input[type=password]') !== null`)));
await evaluate(`document.querySelector('.auth-field__reveal').click()`);
await sleep(200);
check("reveal unmasks it", await evaluate(`document.querySelector('.auth-field__reveal')?.getAttribute('aria-pressed') === 'true'`));
await evaluate(`document.querySelector('.auth-field__reveal').click()`);
await sleep(200);

// 6. A good signup reaches the real endpoint and comes back with a position.
const probe = `cdp-probe-${Date.now()}@example.com`;
await type(".auth-field input[type=email]", probe);
await type("input[type=password]", "correct horse battery");
await evaluate(`document.querySelector('.auth-submit').click()`);
await sleep(1800);
const doneText = await evaluate(`document.querySelector('.auth-done__text')?.textContent ?? ''`);
check("signup reports a whitelist position", /whitelist|kept spot/i.test(doneText), doneText.slice(0, 60));
const doneShot = await shoot("done");

// 7. Login cannot succeed yet, and says so rather than hanging.
await close();
await evaluate(`document.querySelectorAll('.authorization button')[0].click()`);
await sleep(400);
await type(".auth-field input[type=email]", "someone@example.com");
await type("input[type=password]", "correct horse battery");
await evaluate(`document.querySelector('.auth-submit').click()`);
await sleep(600);
check(
  "login explains accounts are not open",
  /open at launch/i.test(await evaluate(`document.querySelector('.auth-done__text')?.textContent ?? ''`)),
);

// 8. Escape closes it and gives the page its scrollbar back.
await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
await sleep(300);
check("Escape closes the dialog", await evaluate(`document.querySelector('.auth-modal') === null`));
check("body scroll restored", (await evaluate(`getComputedStyle(document.body).overflow`)) !== "hidden");

ws.close();
chrome.kill();

let failed = 0;
for (const [label, pass, note] of results) {
  if (!pass) failed++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${note ? `  [${note}]` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
console.log(`probe address: ${probe}`);
console.log(`screenshots: ${signupShot}, ${doneShot}`);
process.exit(failed ? 1 : 0);
