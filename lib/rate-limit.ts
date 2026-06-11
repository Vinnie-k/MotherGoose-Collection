/**
 * Simple in-memory rate limiter.
 * Resets per window. For multi-instance deployments, replace with Upstash/Redis.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check whether a given key (e.g. IP + route) is within its rate limit.
 * Returns { allowed, remaining, resetAt }.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || now > existing.resetAt) {
    // First request in this window
    const entry: RateLimitEntry = { count: 1, resetAt: now + options.windowMs }
    store.set(key, entry)
    return { allowed: true, remaining: options.limit - 1, resetAt: entry.resetAt }
  }

  if (existing.count >= options.limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return { allowed: true, remaining: options.limit - existing.count, resetAt: existing.resetAt }
}

/** Extract the best available IP from Next.js request headers. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}
