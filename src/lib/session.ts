import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Session cookie: a small signed payload, no server-side session store.
 *
 * There is nothing here worth the cost of a sessions collection — the cookie
 * carries the user's email and an expiry, signed with SESSION_SECRET so it
 * cannot be edited. Anything that actually matters (is this account still
 * approved?) is re-read from the database on the request that needs it, so a
 * revoked account cannot keep working just because it holds a valid cookie.
 */

const COOKIE = "inuslots_session";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

type Payload = { email: string; exp: number };

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error(
      "SESSION_SECRET is not set. On the server it comes from /etc/inuslots/env; locally put it in .env.local."
    );
  }
  return value;
}

const b64url = (input: Buffer | string) =>
  Buffer.from(input).toString("base64url");

function sign(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function serialize(payload: Payload): string {
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function parse(token: string | undefined): Payload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(body));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (typeof payload.email !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function startSession(email: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, serialize({ email, exp: Date.now() + MAX_AGE_SECONDS * 1000 }), {
    httpOnly: true,
    // The site is only ever served over HTTPS in production; in dev the cookie
    // would otherwise be dropped on http://localhost.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/** The email in the current session cookie, or null. Does not touch the DB. */
export async function sessionEmail(): Promise<string | null> {
  const store = await cookies();
  return parse(store.get(COOKIE)?.value)?.email ?? null;
}
