import { NextResponse } from "next/server";
import { users, type User } from "@/lib/mongo";
import { hashPassword } from "@/lib/password";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Creates an account in `pending`. Nothing here logs anyone in — accounts are
 * reviewed by hand before they can be used, so registration deliberately does
 * not issue a session.
 */

export const runtime = "nodejs";
// Reads and writes per request; caching it would be actively wrong.
export const dynamic = "force-dynamic";

const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 200;
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many sign-ups from this address. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const dialCode = String(body.dialCode ?? "").trim().slice(0, 8);
  const phone = String(body.phone ?? "").trim().slice(0, 32);
  const promoCode = String(body.promoCode ?? "").trim().slice(0, 64);

  // Validated again here rather than trusting the form: the endpoint is public
  // and the form is not the only way to reach it.
  if (!LOOKS_LIKE_EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: "That does not look like an email address." }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { error: `Use at least ${MIN_PASSWORD} characters for your password.` },
      { status: 400 }
    );
  }
  if (password.length > MAX_PASSWORD) {
    // Long inputs are cheap for the sender and expensive for scrypt.
    return NextResponse.json({ error: "That password is too long." }, { status: 400 });
  }

  const collection = await users();

  const now = new Date();
  const document: User = {
    email,
    passwordHash: await hashPassword(password),
    status: "pending",
    createdAt: now,
    ...(phone ? { phone, dialCode: dialCode || undefined } : {}),
    ...(promoCode ? { promoCode } : {}),
  };

  try {
    await collection.insertOne(document);
  } catch (error) {
    // The unique index on email is what actually prevents duplicates; checking
    // first and inserting after would leave a race between the two.
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "That email is already registered.", code: "DUPLICATE" },
        { status: 409 }
      );
    }
    throw error;
  }

  const pendingAhead = await collection.countDocuments({
    status: "pending",
    createdAt: { $lt: now },
  });

  return NextResponse.json(
    {
      ok: true,
      status: "pending",
      // Gives the visitor something concrete instead of an open-ended wait.
      // Counts the seeded placeholders too (scripts/seed-queue.mjs), which is
      // what starts real sign-ups at #872.
      position: pendingAhead + 1,
    },
    { status: 201 }
  );
}
