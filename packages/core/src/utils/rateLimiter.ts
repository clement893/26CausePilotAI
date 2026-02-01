/**
 * Client-Side Rate Limiter
 * Uses a sliding window algorithm to track requests.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly defaultWindowMs: number;
  private readonly defaultMaxRequests: number;

  constructor(
    defaultWindowMs: number = 60000,
    defaultMaxRequests: number = 60
  ) {
    this.defaultWindowMs = defaultWindowMs;
    this.defaultMaxRequests = defaultMaxRequests;
  }

  isAllowed(
    key: string,
    maxRequests: number = this.defaultMaxRequests,
    windowMs: number = this.defaultWindowMs
  ): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);
    if (!entry || now > entry.resetTime) {
      this.limits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    if (entry.count >= maxRequests) return false;
    entry.count++;
    return true;
  }

  getRemaining(key: string, maxRequests: number = this.defaultMaxRequests): number {
    const entry = this.limits.get(key);
    if (!entry) return maxRequests;
    const now = Date.now();
    if (now > entry.resetTime) return maxRequests;
    return Math.max(0, maxRequests - entry.count);
  }

  getResetTime(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;
    return Math.max(0, entry.resetTime - Date.now());
  }

  reset(key: string): void {
    this.limits.delete(key);
  }

  clear(): void {
    this.limits.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) this.limits.delete(key);
    }
  }
}

export const rateLimiter = new RateLimiter();

if (typeof window !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}

export const RATE_LIMIT_CONFIG = {
  auth: { maxRequests: 10, windowMs: 60000 },
  upload: { maxRequests: 5, windowMs: 60000 },
  api: { maxRequests: 60, windowMs: 60000 },
  search: { maxRequests: 30, windowMs: 60000 },
} as const;

export function getRateLimitKey(url: string): string {
  try {
    const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    const pathname = urlObj.pathname;
    if (pathname.includes('/auth/')) return `auth:${pathname}`;
    if (pathname.includes('/upload')) return `upload:${pathname}`;
    if (pathname.includes('/search')) return `search:${pathname}`;
    return `api:${pathname}`;
  } catch {
    return `api:${url}`;
  }
}

export function getRateLimitConfig(url: string): { maxRequests: number; windowMs: number } {
  const key = getRateLimitKey(url);
  if (key.startsWith('auth:')) return RATE_LIMIT_CONFIG.auth;
  if (key.startsWith('upload:')) return RATE_LIMIT_CONFIG.upload;
  if (key.startsWith('search:')) return RATE_LIMIT_CONFIG.search;
  return RATE_LIMIT_CONFIG.api;
}
