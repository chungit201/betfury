import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { users, type UserStatus } from "@/lib/mongo";

/**
 * Review queue. Behind a bearer token from /etc/inuslots/env, not behind a
 * user session — there is no notion of an admin account, and inventing one
 * would mean an admin account that itself needs approving.
 *
 * `scripts/admin-users.mjs` is the client; run it on the VM.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: UserStatus[] = ["pending", "approved", "rejected"];

function authorized(request: Request): boolean {
  const expected = process.env.ADMIN_TOKEN;
  // An unset token must not mean "everything is allowed".
  if (!expected) return false;

  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 100) || 100, 500);

  // Seeded placeholders only exist to pad the queue; reviewing them is noise.
  const real = { seeded: { $ne: true } };
  const filter = status && STATUSES.includes(status as UserStatus) ? { ...real, status: status as UserStatus } : real;

  const collection = await users();
  const list = await collection
    .find(filter, {
      // Never leave this out. The hash has no business crossing the wire even
      // to an authenticated admin.
      projection: { passwordHash: 0 },
    })
    .sort({ createdAt: 1 })
    .limit(limit)
    .toArray();

  const counts = await collection
    .aggregate<{ _id: UserStatus; n: number }>([
      { $match: real },
      { $group: { _id: "$status", n: { $sum: 1 } } },
    ])
    .toArray();

  return NextResponse.json({
    counts: Object.fromEntries(STATUSES.map((s) => [s, counts.find((c) => c._id === s)?.n ?? 0])),
    users: list.map((u) => ({
      email: u.email,
      status: u.status,
      createdAt: u.createdAt,
      phone: u.dialCode && u.phone ? `${u.dialCode} ${u.phone}` : u.phone,
      promoCode: u.promoCode,
      reviewedAt: u.reviewedAt,
      lastLoginAt: u.lastLoginAt,
    })),
  });
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const action = String(body.action ?? "");
  if (!email) return NextResponse.json({ error: "email is required." }, { status: 400 });
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be approve or reject." }, { status: 400 });
  }

  const status: UserStatus = action === "approve" ? "approved" : "rejected";
  const result = await (await users()).findOneAndUpdate(
    { email },
    { $set: { status, reviewedAt: new Date(), reviewedBy: "admin" } },
    { returnDocument: "after", projection: { passwordHash: 0 } }
  );

  if (!result) return NextResponse.json({ error: "No such account." }, { status: 404 });

  return NextResponse.json({ ok: true, email: result.email, status: result.status });
}
