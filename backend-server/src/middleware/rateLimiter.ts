import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

/**
 * Simple in-memory rate limiter.
 * Tracks request counts per IP with a sliding window.
 * Suitable for single-instance deployments.
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipStore = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipStore) {
    if (now > entry.resetAt) {
      ipStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Creates a rate limiting middleware.
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export function rateLimiter(maxRequests: number = 10, windowMs: number = 60 * 1000) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const entry = ipStore.get(ip);

    if (!entry || now > entry.resetAt) {
      // New window
      ipStore.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      throw new AppError(
        `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`,
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    entry.count++;
    next();
  };
}
