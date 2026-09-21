import { NextResponse } from "next/server";
import { publicUser, users } from "@/lib/mongo";
import { verifyPassword } from "@/lib/password";
import { startSession } from "@/lib/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Checks credentials, then checks whether the account has been approved.
 *
 * Order matters: the "your account is under review" message is only shown to
 * someone who proved they own the account. Reporting review status before
 * verifying the password would turn this endpoint into a way to enumerate who
 * has registered.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Deliberately identical for "no such user" and "wrong password", so the
// response cannot be used to find out which addresses exist.
const BAD_CREDENTIALS = "Email or password is incorrect.";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
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
  if (!email || !password || password.length > 200) {
    return NextResponse.json({ error: BAD_CREDENTIALS, code: "BAD_CREDENTIALS" }, { status: 401 });
  }

  const user = await (await users()).findOne({ email });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: BAD_CREDENTIALS, code: "BAD_CREDENTIALS" }, { status: 401 });
  }

  if (user.status === "pending") {
    return NextResponse.json(
      {
        error: "Your account is still being reviewed.",
        code: "PENDING",
        status: "pending",
      },
      { status: 403 }
    );
  }

  if (user.status === "rejected") {
    return NextResponse.json(
      {
        error: "This account was not approved.",
        code: "REJECTED",
        status: "rejected",
      },
      { status: 403 }
    );
  }

  await (await users()).updateOne({ email }, { $set: { lastLoginAt: new Date() } });
  await startSession(email);

  return NextResponse.json({ ok: true, user: publicUser(user) });
}
