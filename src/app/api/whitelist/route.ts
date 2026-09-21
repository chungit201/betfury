import fs from "node:fs/promises";
import path from "node:path";

// Whitelist signups are appended to a JSON file next to the project. That is
// enough for a local demo and keeps the entries somewhere you can actually read
// them — but it writes to the filesystem, so it will not survive a serverless
// deploy. Swap this for a database or a mailing-list API before shipping.
const STORE = path.join(process.cwd(), "data", "whitelist.json");

type Entry = { email: string; joinedAt: string };

// Deliberately loose: the goal is to catch typos, not to police what a valid
// address looks like. Anything stricter rejects real addresses.
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function readAll(): Promise<Entry[]> {
  try {
    return JSON.parse(await fs.readFile(STORE, "utf8")) as Entry[];
  } catch {
    // Missing file on first signup, or a truncated one — either way, start over
    // rather than failing the request.
    return [];
  }
}

export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (typeof email !== "string" || !LOOKS_LIKE_EMAIL.test(email.trim())) {
    return Response.json({ error: "That doesn't look like an email address." }, { status: 400 });
  }

  const normalised = email.trim().toLowerCase();
  const entries = await readAll();

  if (entries.some((e) => e.email === normalised)) {
    // Already on the list is a success from the visitor's point of view.
    return Response.json({ ok: true, alreadyJoined: true, position: entries.findIndex((e) => e.email === normalised) + 1 });
  }

  entries.push({ email: normalised, joinedAt: new Date().toISOString() });
  await fs.mkdir(path.dirname(STORE), { recursive: true });
  await fs.writeFile(STORE, JSON.stringify(entries, null, 2));

  return Response.json({ ok: true, alreadyJoined: false, position: entries.length });
}

export async function GET() {
  const entries = await readAll();
  // The addresses themselves are not public; only the count is.
  return Response.json({ count: entries.length });
}
