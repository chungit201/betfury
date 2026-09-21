// Pads the review queue with placeholder accounts so the next real sign-up is
// told "#872" rather than "#1" — an empty queue reads as an empty site.
//
//   node --env-file=.env scripts/seed-queue.mjs            # top up to 871 ahead
//   node --env-file=.env scripts/seed-queue.mjs --remove   # delete them all
//
// Idempotent: it counts every pending account (real ones included) and only
// adds the shortfall, so re-running it is harmless.
//
// The rows are marked `seeded: true`, which keeps them out of the admin list
// and counts. Their passwordHash matches no password, so they cannot sign in.
import { MongoClient } from "mongodb";

const FIRST_POSITION = 872;
const DOMAIN = "seed.inuslots.invalid";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not set. Run with --env-file=.env.");

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
await client.connect();
const users = client.db().collection("users");

try {
  if (process.argv.includes("--remove")) {
    const { deletedCount } = await users.deleteMany({ seeded: true });
    console.log(`removed ${deletedCount} seeded account(s)`);
  } else {
    const pending = await users.countDocuments({ status: "pending" });
    const missing = FIRST_POSITION - 1 - pending;
    if (missing <= 0) {
      console.log(`${pending} pending already; next sign-up is #${pending + 1}. Nothing to add.`);
    } else {
      const existing = await users.countDocuments({ seeded: true });
      const now = Date.now();
      const month = 30 * 24 * 60 * 60 * 1000;
      const docs = Array.from({ length: missing }, (_, i) => {
        const n = String(existing + i + 1).padStart(4, "0");
        return {
          email: `seed-${n}@${DOMAIN}`,
          passwordHash: "!",
          status: "pending",
          // Spread over the last month, and always in the past, so every one of
          // them counts as "ahead" of a sign-up happening now.
          createdAt: new Date(now - month + Math.floor((month - 60_000) * (i / missing))),
          seeded: true,
        };
      });
      await users.insertMany(docs, { ordered: false });
      console.log(`added ${missing} seeded account(s); next sign-up is #${pending + missing + 1}`);
    }
  }
} finally {
  await client.close();
}
