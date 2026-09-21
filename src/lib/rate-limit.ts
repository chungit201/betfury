/**
 * A fixed-window rate limiter held in process memory.
 *
 * Deliberately not Redis: the app runs as a single pm2 process on one VM, so
 * process memory is the whole cluster. If it is ever scaled out this becomes a
 * per-instance limit rather than a global one — which weakens it but does not
 * break it, and the comment is here so that is a decision rather than a
 * surprise.
 *
 * The point is to make credential stuffing expensive, not to be exact.
 */

type Window = { count: number; resetAt: number };
const windows = new Map<string, Window>();

// Bounded so a flood of unique addresses cannot grow the map without limit.
const MAX_KEYS = 10_000;

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_KEYS) {
      for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
      // Still full after clearing expired entries: this is an attack, not
      // traffic. Fail closed.
      if (windows.size >= MAX_KEYS) return { ok: false, retryAfter: Math.ceil(windowMs / 1000) };
    }
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { ok: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/**
 * The client's address. nginx sets X-Forwarded-For, and Cloudflare sets
 * CF-Connecting-IP in front of that — the latter is the one a visitor cannot
 * spoof, because Cloudflare overwrites it.
 */
export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}
