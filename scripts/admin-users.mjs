#!/usr/bin/env node
/**
 * Review queue, from the VM.
 *
 *   node scripts/admin-users.mjs                    # pending accounts
 *   node scripts/admin-users.mjs list approved
 *   node scripts/admin-users.mjs approve a@b.com
 *   node scripts/admin-users.mjs reject  a@b.com
 *   node scripts/admin-users.mjs approve-all        # everything pending
 *
 * Talks to the running app over localhost rather than to MongoDB directly, so
 * there is exactly one implementation of what "approve" means. The token comes
 * from /etc/inuslots/env, which is root-readable only — hence the sudo.
 */
import fs from "node:fs";
import readline from "node:readline/promises";

const ENV_FILE = process.env.INUSLOTS_ENV ?? "/etc/inuslots/env";
const BASE = process.env.INUSLOTS_BASE ?? "http://127.0.0.1:3000";

function readToken() {
  if (process.env.ADMIN_TOKEN) return process.env.ADMIN_TOKEN;
  let raw;
  try {
    raw = fs.readFileSync(ENV_FILE, "utf8");
  } catch (error) {
    if (error.code === "EACCES") {
      console.error(`Cannot read ${ENV_FILE}. Run this with sudo -E, or export ADMIN_TOKEN.`);
    } else {
      console.error(`Cannot read ${ENV_FILE}: ${error.message}`);
    }
    process.exit(1);
  }
  const match = raw.match(/^ADMIN_TOKEN=(.+)$/m);
  if (!match) {
    console.error(`ADMIN_TOKEN is not in ${ENV_FILE}.`);
    process.exit(1);
  }
  return match[1].trim();
}

const TOKEN = readToken();

async function api(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error(`${res.status} from ${path}: ${text.slice(0, 200)}`);
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`${res.status}: ${data.error ?? text}`);
    process.exit(1);
  }
  return data;
}

const pad = (s, n) => String(s ?? "").padEnd(n);
const when = (d) => (d ? new Date(d).toISOString().replace("T", " ").slice(0, 16) : "");

async function list(status = "pending") {
  const data = await api(`/api/admin/users?status=${encodeURIComponent(status)}`);
  const { pending, approved, rejected } = data.counts;
  console.log(`pending ${pending} · approved ${approved} · rejected ${rejected}\n`);

  if (!data.users.length) {
    console.log(`No ${status} accounts.`);
    return data;
  }

  console.log(`${pad("EMAIL", 34)}${pad("REGISTERED", 18)}${pad("PHONE", 18)}PROMO`);
  console.log("-".repeat(84));
  for (const u of data.users) {
    console.log(`${pad(u.email, 34)}${pad(when(u.createdAt), 18)}${pad(u.phone, 18)}${u.promoCode ?? ""}`);
  }
  return data;
}

async function review(email, action) {
  const data = await api("/api/admin/users", {
    method: "POST",
    body: JSON.stringify({ email, action }),
  });
  console.log(`${data.email} -> ${data.status}`);
}

const [command = "list", argument] = process.argv.slice(2);

switch (command) {
  case "list":
    await list(argument ?? "pending");
    break;

  case "approve":
  case "reject": {
    if (!argument) {
      console.error(`Usage: node scripts/admin-users.mjs ${command} <email>`);
      process.exit(1);
    }
    await review(argument, command);
    break;
  }

  case "approve-all": {
    const data = await list("pending");
    if (!data.users.length) break;
    // Bulk approval is the one action here with no undo worth the name, so it
    // asks first rather than trusting the command name.
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(`\nApprove all ${data.users.length}? [y/N] `);
    rl.close();
    if (answer.trim().toLowerCase() !== "y") {
      console.log("Nothing changed.");
      break;
    }
    for (const u of data.users) await review(u.email, "approve");
    break;
  }

  default:
    console.error(`Unknown command "${command}". Try: list | approve | reject | approve-all`);
    process.exit(1);
}
