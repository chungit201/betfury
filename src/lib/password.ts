import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Password hashing with scrypt from node:crypto.
 *
 * scrypt rather than bcrypt so there is no dependency to install, no native
 * build step on the VM, and no 72-byte input truncation. The cost parameters
 * below are the ones RFC 7914 gives as an interactive-login baseline: N=2^15
 * costs roughly 100ms and 32MB per hash here, which is a real deterrent to
 * offline cracking while still being fine for a login endpoint.
 */

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

const N = 32768;
const r = 8;
const p = 1;
const KEYLEN = 64;
// Node's default maxmem (32MB) is just under what N=2^15, r=8 needs, and the
// error it throws is an unhelpful "Invalid scrypt params".
const MAXMEM = 128 * 1024 * 1024;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEYLEN, { N, r, p, maxmem: MAXMEM });
  // Parameters travel with the hash so they can be raised later without
  // invalidating every existing password.
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, nRaw, rRaw, pRaw, saltRaw, hashRaw] = parts;
  const salt = Buffer.from(saltRaw, "base64");
  const expected = Buffer.from(hashRaw, "base64");

  let derived: Buffer;
  try {
    derived = await scryptAsync(password, salt, expected.length, {
      N: Number(nRaw),
      r: Number(rRaw),
      p: Number(pRaw),
      maxmem: MAXMEM,
    });
  } catch {
    // Corrupt or hostile parameters in the stored value.
    return false;
  }

  // Lengths must match before timingSafeEqual, which throws otherwise — and
  // throwing on a length mismatch would itself leak information.
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
