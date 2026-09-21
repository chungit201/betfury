import { MongoClient, type Db, type Collection } from "mongodb";

/**
 * One MongoClient for the whole process, and the collection handles that go
 * with it.
 *
 * The client is cached on `globalThis` rather than in a module-level `let`
 * because Next's dev server re-evaluates modules on every edit — without this
 * a long session leaks a connection pool per hot reload until Mongo refuses
 * new connections.
 */

const uri = process.env.MONGODB_URI;

export type UserStatus = "pending" | "approved" | "rejected";

// No `_id` field: the driver adds it through `WithId`/`OptionalId`, and
// declaring it here as anything looser than ObjectId makes insertOne reject the
// document.
export type User = {
  email: string;
  /** scrypt, see src/lib/password.ts. Never returned to a client. */
  passwordHash: string;
  /** Stored as entered, split, so a future SMS step does not have to guess. */
  dialCode?: string;
  phone?: string;
  promoCode?: string;
  status: UserStatus;
  createdAt: Date;
  /** Set when an admin moves the account out of `pending`. */
  reviewedAt?: Date;
  reviewedBy?: string;
  lastLoginAt?: Date;
};

type Cache = { client: MongoClient; promise: Promise<MongoClient> } | undefined;
const globalForMongo = globalThis as unknown as { __inuslotsMongo?: Cache };

function clientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. On the server it comes from /etc/inuslots/env; locally put it in .env.local."
    );
  }
  if (!globalForMongo.__inuslotsMongo) {
    const client = new MongoClient(uri, {
      // The app and the database are on the same box, so a small pool is
      // plenty and keeps memory down on a 2GB VM.
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    globalForMongo.__inuslotsMongo = { client, promise: client.connect() };
  }
  return globalForMongo.__inuslotsMongo.promise;
}

export async function db(): Promise<Db> {
  return (await clientPromise()).db();
}

let indexesReady: Promise<void> | undefined;

export async function users(): Promise<Collection<User>> {
  const collection = (await db()).collection<User>("users");

  // Created once per process, and awaited so the first request cannot race the
  // unique index into existence and let a duplicate through.
  indexesReady ??= (async () => {
    await collection.createIndex({ email: 1 }, { unique: true });
    await collection.createIndex({ status: 1, createdAt: -1 });
  })();
  await indexesReady;

  return collection;
}

/** What is safe to hand back to a browser. */
export function publicUser(user: User) {
  return {
    email: user.email,
    status: user.status,
    createdAt: user.createdAt,
  };
}
