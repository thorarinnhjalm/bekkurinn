import { LRUCache } from 'lru-cache';
import { NextRequest } from 'next/server';


/**
 * Rate Limiter Utility for Bekkurinn
 * 
 * Prevents API abuse with in-memory request tracking.
 * Uses LRU cache for automatic cleanup of old entries.
 */

interface RateLimitResult {
    success: boolean;
    remaining?: number;
    resetAt?: number;
}

// Cache configuration
const ratelimitCache = new LRUCache<string, number>({
    max: 500, // Track up to 500 unique identifiers
    ttl: 60000, // 1 minute TTL
});

/**
 * Check if request is within rate limit
 * 
 * @param identifier - Unique identifier (IP, user ID, etc)
 * @param limit - Max requests per window (default: 10)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 min)
 * @returns Result object with success status and remaining requests
 */
export async function rateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000
): Promise<RateLimitResult> {
    const count = (ratelimitCache.get(identifier) as number) || 0;

    if (count >= limit) {
        // Calculate when the limit will reset
        const resetAt = Date.now() + windowMs;

        return {
            success: false,
            remaining: 0,
            resetAt,
        };
    }

    // Increment counter
    const newCount = count + 1;
    ratelimitCache.set(identifier, newCount);

    return {
        success: true,
        remaining: limit - newCount,
    };
}

/**
 * Get client IP from request
 * Handles proxies and load balancers
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    if (forwarded) {
        // x-forwarded-for can contain multiple IPs, take the first
        return forwarded.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    // Fallback to connection IP (may not be available in all environments)
    return 'unknown';
}

/**
 * Rate limit middleware for API routes
 * Usage in route handler:
 * 
 * ```typescript
 * import { withRateLimit } from '@/lib/rate-limit';
 * 
 * export const GET = withRateLimit(async (request) => {
 *   // Your handler code
 * }, { limit: 10, windowMs: 60000 });
 * ```
 */
export function withRateLimit(
    handler: (request: Request) => Promise<Response>,
    options: { limit?: number; windowMs?: number } = {}
) {
    return async (request: Request): Promise<Response> => {
        const identifier = getClientIp(request);
        const result = await rateLimit(
            identifier,
            options.limit || 10,
            options.windowMs || 60000
        );

        if (!result.success) {
            return new Response(
                JSON.stringify({
                    error: 'Too many requests',
                    message: 'Þú hefur sent of margar beiðnir. Reyndu aftur eftir smá stund.',
                    resetAt: result.resetAt,
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': '60',
                        'X-RateLimit-Limit': String(options.limit || 10),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(result.resetAt),
                    },
                }
            );
        }

        // Add rate limit headers to successful responses
        const response = await handler(request);

        // Clone response to add headers
        const headers = new Headers(response.headers);
        headers.set('X-RateLimit-Limit', String(options.limit || 10));
        headers.set('X-RateLimit-Remaining', String(result.remaining || 0));

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    };
}

/**
 * Helper for Next.js API routes that accept NextRequest
 */
export function getClientIpFromNextRequest(request: NextRequest): string {
    // Try various headers that might contain the real IP
    const headers = [
        'x-forwarded-for',
        'x-real-ip',
        'cf-connecting-ip', // Cloudflare
        'x-vercel-forwarded-for', // Vercel
    ];

    for (const header of headers) {
        const value = request.headers.get(header);
        if (value) {
            // Handle comma-separated IPs (take first)
            return value.split(',')[0].trim();
        }
    }

    // Fallback
    return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || (request as any).ip || 'unknown';
}
