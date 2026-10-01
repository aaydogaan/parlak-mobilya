interface RateLimitRecord {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now - record.firstAttempt > 3600000 && (!record.blockedUntil || now > record.blockedUntil)) {
        rateLimitStore.delete(key);
      }
    }
  }, 300000);
  if (cleanupTimer.unref) cleanupTimer.unref();
}

/**
 * Extract caller client IP address securely from Cloudflare / reverse-proxy headers.
 */
export function getClientIp(req?: Request | Headers | null): string {
  if (!req) return "127.0.0.1";

  const headers = "headers" in req ? req.headers : req;
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((s) => s.trim());
    if (ips[0]) return ips[0];
  }

  return "127.0.0.1";
}

/**
 * Sliding Window Rate Limiter
 * @param key unique bucket identifier (e.g. login:ip:1.2.3.4 or login:user:admin@site.com)
 * @param maxAttempts maximum allowed attempts before temporary block
 * @param windowMs time window in milliseconds (e.g. 15 * 60 * 1000 for 15 mins)
 * @param blockDurationMs how long to lock out after exceeding maxAttempts (e.g. 15 * 60 * 1000)
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
  blockDurationMs = 15 * 60 * 1000,
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    return { allowed: true, remaining: maxAttempts, retryAfterSec: 0 };
  }

  if (record.blockedUntil && now < record.blockedUntil) {
    const retryAfterSec = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  // Window expired -> reset
  if (now - record.firstAttempt > windowMs) {
    rateLimitStore.delete(key);
    return { allowed: true, remaining: maxAttempts, retryAfterSec: 0 };
  }

  const remaining = Math.max(0, maxAttempts - record.attempts);
  const allowed = record.attempts < maxAttempts;

  return {
    allowed,
    remaining,
    retryAfterSec: allowed ? 0 : Math.ceil((record.firstAttempt + windowMs - now) / 1000),
  };
}

/**
 * Record a failed attempt and apply temporary lockout if limit reached.
 */
export function recordFailedAttempt(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
  blockDurationMs = 15 * 60 * 1000,
): void {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now - record.firstAttempt > windowMs) {
    rateLimitStore.set(key, {
      attempts: 1,
      firstAttempt: now,
    });
    return;
  }

  record.attempts += 1;
  if (record.attempts >= maxAttempts) {
    record.blockedUntil = now + blockDurationMs;
  }
}

/**
 * Reset rate limit bucket on successful authentication.
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}
