import { NextResponse } from "next/server";
import { endSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST rather than GET so a stray <img src="/api/auth/logout"> on another site
// cannot sign people out.
export async function POST() {
  await endSession();
  return NextResponse.json({ ok: true });
}
