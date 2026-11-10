/**
 * In-memory sliding-window rate limiter. Keyed by caller-supplied key
 * (client IP for public routes). One process = one bucket store; run
 * behind a single Node instance or swap for Redis when scaling out.
 */
export interface RateLimitOptions {
  /** Max requests allowed per window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Injectable clock for tests. Defaults to Date.now. */
  now?: () => number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Requests remaining in the current window. */
  remaining: number;
  /** Ms until the window resets (for Retry-After). */
  retryAfterMs: number;
}

const buckets = new Map<string, number[]>();

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = (opts.now ?? Date.now)();
  const windowStart = now - opts.windowMs;

  // Reap only this key's timestamps. A periodic global sweep guards
  // against unbounded growth from one-off attacker IPs.
  if (buckets.size > 10_000) {
    for (const [k, stamps] of buckets) {
      const alive = stamps.filter((t) => t > windowStart);
      if (alive.length === 0) buckets.delete(k);
      else buckets.set(k, alive);
    }
  }

  const recent = (buckets.get(key) ?? []).filter((t) => t > windowStart);

  if (recent.length >= opts.max) {
    const retryAfterMs = recent[0] + opts.windowMs - now;
    buckets.set(key, recent);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  recent.push(now);
  buckets.set(key, recent);
  return {
    allowed: true,
    remaining: opts.max - recent.length,
    retryAfterMs: opts.windowMs,
  };
}

/**
 * Best-effort client IP for rate-limit keying. Behind a proxy that sets
 * x-forwarded-for, the leftmost entry is the original client. Without
 * one, fall back to a shared bucket — limits stay correct, just coarser.
 */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}
