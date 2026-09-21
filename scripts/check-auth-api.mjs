#!/usr/bin/env node
/**
 * Exercises the account endpoints against a running site.
 *
 *   node scripts/check-auth-api.mjs [baseUrl]
 *
 * The approval step needs ADMIN_TOKEN, which only exists on the VM. Pass it in
 * (`ADMIN_TOKEN=... node ...`) to run the whole flow; without it the script
 * still covers everything up to approval and reports the rest as skipped.
 *
 * Run against production and it creates real accounts — every address it uses
 * starts with `probe-`, and scripts/server-clean-probes.sh removes them.
 */

const base = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "";

const stamp = Date.now();
const EMAIL = `probe-${stamp}@example.com`;
const PASSWORD = "a-perfectly-fine-password";

const results = [];
const check = (label, pass, note = "") => {
  results.push([label, pass, note]);
  return pass;
};

/** Keeps the session cookie across calls, which fetch does not do on its own. */
let cookie = "";
async function call(path, init = {}) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    redirect: "manual",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...init.headers,
    },
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  for (const c of setCookie) {
    const [pair] = c.split(";");
    const [name] = pair.split("=");
    if (name === "inuslots_session") cookie = pair;
  }
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* some responses have no body */
  }
  return { status: res.status, body, setCookie };
}

console.log(`base:  ${base}`);
console.log(`probe: ${EMAIL}\n`);

// --- registration ---------------------------------------------------------

let r = await call("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({ email: EMAIL, password: PASSWORD, dialCode: "+84", phone: "900000000" }),
});
check("register returns 201", r.status === 201, String(r.status));
check("new account is pending", r.body?.status === "pending", r.body?.status ?? "");
check("registration does not sign you in", !cookie, cookie ? "cookie was set!" : "no cookie");
check("queue position reported", typeof r.body?.position === "number", String(r.body?.position));

r = await call("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({ email: EMAIL.toUpperCase(), password: PASSWORD }),
});
check("duplicate is rejected, case-insensitively", r.status === 409 && r.body?.code === "DUPLICATE", String(r.status));

r = await call("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({ email: "not-an-email", password: PASSWORD }),
});
check("malformed address is rejected", r.status === 400, String(r.status));

r = await call("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({ email: `probe-short-${stamp}@example.com`, password: "short" }),
});
check("short password is rejected", r.status === 400, String(r.status));

// --- login before approval ------------------------------------------------

r = await call("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email: EMAIL, password: "the-wrong-password" }),
});
check("wrong password is rejected", r.status === 401 && r.body?.code === "BAD_CREDENTIALS", String(r.status));

const unknown = await call("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email: `probe-nobody-${stamp}@example.com`, password: PASSWORD }),
});
check(
  "unknown address is indistinguishable from a wrong password",
  unknown.status === 401 && unknown.body?.error === r.body?.error,
  `${unknown.status} / ${unknown.body?.error}`,
);

r = await call("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
check("correct password on a pending account gets 403 PENDING", r.status === 403 && r.body?.code === "PENDING", String(r.status));
check("pending login sets no session", !cookie, cookie ? "cookie was set!" : "no cookie");

r = await call("/api/auth/me");
check("me reports nobody without a session", r.body?.user === null);

// --- admin ----------------------------------------------------------------

r = await call("/api/admin/users");
check("admin endpoint rejects a missing token", r.status === 401, String(r.status));

r = await call("/api/admin/users", { headers: { Authorization: "Bearer not-the-token" } });
check("admin endpoint rejects a wrong token", r.status === 401, String(r.status));

if (!ADMIN_TOKEN) {
  console.log("ADMIN_TOKEN not set — skipping approval, approved login, me and logout.\n");
} else {
  const admin = { Authorization: `Bearer ${ADMIN_TOKEN}` };

  r = await call("/api/admin/users?status=pending", { headers: admin });
  check(
    "pending queue lists the new account",
    r.status === 200 && r.body?.users?.some((u) => u.email === EMAIL),
    `${r.body?.counts?.pending} pending`,
  );
  check(
    "admin listing never includes password hashes",
    r.status === 200 && !JSON.stringify(r.body).includes("passwordHash"),
  );

  r = await call("/api/admin/users", {
    method: "POST",
    headers: admin,
    body: JSON.stringify({ email: EMAIL, action: "approve" }),
  });
  check("approve works", r.status === 200 && r.body?.status === "approved", String(r.status));

  // --- login after approval ---------------------------------------------

  r = await call("/api/auth/login", { method: "POST", body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  check("approved account can log in", r.status === 200 && r.body?.ok === true, String(r.status));
  check("login sets a session cookie", Boolean(cookie), cookie ? "set" : "missing");
  check(
    "session cookie is HttpOnly and SameSite",
    r.setCookie.some((c) => /HttpOnly/i.test(c) && /SameSite=Lax/i.test(c)),
  );
  check("login response carries no password hash", !JSON.stringify(r.body).includes("passwordHash"));

  r = await call("/api/auth/me");
  check("me identifies the session", r.body?.user?.email === EMAIL, r.body?.user?.email ?? "none");
  check("me reports approved", r.body?.user?.status === "approved", r.body?.user?.status ?? "");

  // --- revocation takes effect immediately ------------------------------

  await call("/api/admin/users", {
    method: "POST",
    headers: admin,
    body: JSON.stringify({ email: EMAIL, action: "reject" }),
  });
  r = await call("/api/auth/me");
  check(
    "rejecting an account invalidates its live session on the next request",
    r.body?.user === null,
    JSON.stringify(r.body),
  );

  // --- logout -----------------------------------------------------------

  r = await call("/api/auth/logout", { method: "POST" });
  check("logout returns ok", r.status === 200, String(r.status));
}

// A tampered cookie must not be accepted.
cookie = "inuslots_session=eyJlbWFpbCI6ImF0dGFja2VyQGV4YW1wbGUuY29tIiwiZXhwIjo5OTk5OTk5OTk5OTk5fQ.bm90LWEtcmVhbC1zaWduYXR1cmU";
r = await call("/api/auth/me");
check("a forged session cookie is refused", r.body?.user === null, JSON.stringify(r.body));

let failed = 0;
for (const [label, pass, note] of results) {
  if (!pass) failed++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${note ? `  [${note}]` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
console.log(`probe accounts created: ${EMAIL}, probe-short-${stamp}@example.com`);
process.exit(failed ? 1 : 0);
