/**
 * Rate Limiting Utility
 * Uses Upstash Redis for distributed rate limiting
 */

import { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Create different rate limiters for different use cases
export const rateLimiters = {
  // Strict rate limit for sensitive operations (e.g., delete, admin actions)
  strict: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
    analytics: true,
    prefix: 'ratelimit:strict',
  }),

  // Moderate rate limit for standard operations
  moderate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 requests per minute
    analytics: true,
    prefix: 'ratelimit:moderate',
  }),

  // Lenient rate limit for read operations
  lenient: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    analytics: true,
    prefix: 'ratelimit:lenient',
  }),

  // Very strict for authentication endpoints
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '5 m'), // 5 requests per 5 minutes
    analytics: true,
    prefix: 'ratelimit:auth',
  }),
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a given identifier
 */
export const checkRateLimit = async (
  identifier: string,
  type: keyof typeof rateLimiters = 'moderate'
): Promise<RateLimitResult> => {
  try {
    const ratelimit = rateLimiters[type];
    const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

    return {
      success,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - if rate limiting fails, allow the request
    return {
      success: true,
      limit: 100,
      remaining: 100,
      reset: Date.now() + 60000,
    };
  }
};

/**
 * Get rate limit headers for response
 */
export const getRateLimitHeaders = (result: RateLimitResult): Record<string, string> => {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };
};

/**
 * Middleware wrapper for rate limiting
 */
export const withRateLimit = async (
  req: NextRequest,
  type: keyof typeof rateLimiters = 'moderate'
): Promise<{ success: boolean; headers?: Record<string, string> }> => {
  // Use IP address as identifier
  const identifier = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

  const result = await checkRateLimit(identifier, type);

  if (!result.success) {
    return {
      success: false,
      headers: getRateLimitHeaders(result),
    };
  }

  return {
    success: true,
    headers: getRateLimitHeaders(result),
  };
};
