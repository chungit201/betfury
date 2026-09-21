import { NextResponse } from "next/server";
import { publicUser, users } from "@/lib/mongo";
import { endSession, sessionEmail } from "@/lib/session";

/**
 * Who the session cookie belongs to.
 *
 * The account is re-read from the database rather than trusted from the
 * cookie: an account suspended after signing in must stop working on its next
 * request, not in thirty days when the cookie expires.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const email = await sessionEmail();
  if (!email) return NextResponse.json({ user: null });

  const user = await (await users()).findOne({ email });
  if (!user || user.status !== "approved") {
    // Deleted, or no longer approved. Drop the cookie so the browser stops
    // presenting it.
    await endSession();
    return NextResponse.json({ user: null, ...(user ? { status: user.status } : {}) });
  }

  return NextResponse.json({ user: publicUser(user) });
}
