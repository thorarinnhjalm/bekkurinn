import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIpFromNextRequest } from '@/lib/rate-limit';

/**
 * Calendar Proxy API - Secure ICS Fetcher
 * 
 * SECURITY: Protected against SSRF attacks with:
 * - Domain whitelist (only approved school websites)
 * - HTTPS enforcement
 * - Request timeout (5 seconds)
 * - Redirect blocking
 * - Size limit validation
 * - Rate limiting (10 requests/minute per IP)
 */

// Whitelist of allowed calendar sources (Icelandic municipalities)
const ALLOWED_DOMAINS = [
    'www.reykjavik.is',
    'reykjavik.is',
    'kopavogur.is',
    'www.kopavogur.is',
    'gardabaer.is',
    'www.gardabaer.is',
    'mosfellsbaer.is',
    'www.mosfellsbaer.is',
    'seltjarnarnes.is',
    'www.seltjarnarnes.is',
    'hafnarfjordur.is',
    'www.hafnarfjordur.is',
    'keflavik.is',
    'www.keflavik.is',
];

const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5MB limit
const FETCH_TIMEOUT = 5000; // 5 seconds

export async function GET(request: NextRequest) {
    // RATE LIMIT: 10 requests per minute per IP
    const clientIp = getClientIpFromNextRequest(request);
    const limitResult = await rateLimit(clientIp, 10, 60000);

    if (!limitResult.success) {
        return NextResponse.json({
            error: 'Too many requests',
            message: 'Þú hefur sent of margar beiðnir. Reyndu aftur eftir smá stund.',
            resetAt: limitResult.resetAt,
        }, {
            status: 429,
            headers: {
                'Retry-After': '60',
                'X-RateLimit-Limit': '10',
                'X-RateLimit-Remaining': '0',
            }
        });
    }

    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({
            error: 'Missing URL parameter'
        }, { status: 400 });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
        parsedUrl = new URL(url);
    } catch {
        return NextResponse.json({
            error: 'Invalid URL format'
        }, { status: 400 });
    }

    // SECURITY CHECK #1: Only allow HTTPS
    if (parsedUrl.protocol !== 'https:') {
        return NextResponse.json({
            error: 'Only HTTPS URLs are allowed'
        }, { status: 403 });
    }

    // SECURITY CHECK #2: Validate against whitelist
    const isAllowedDomain = ALLOWED_DOMAINS.some(domain =>
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
    );

    if (!isAllowedDomain) {
        return NextResponse.json({
            error: 'Domain not in whitelist',
            hint: 'Only Icelandic school calendars are supported'
        }, { status: 403 });
    }

    // SECURITY CHECK #3: Block localhost and private IPs
    const hostname = parsedUrl.hostname.toLowerCase();
    if (
        hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')
    ) {
        return NextResponse.json({
            error: 'Private IP addresses are not allowed'
        }, { status: 403 });
    }

    try {
        // SECURITY: Abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch(url, {
            signal: controller.signal,
            redirect: 'manual', // SECURITY: Don't follow redirects
            headers: {
                'User-Agent': 'Bekkurinn-Calendar-Sync/1.0',
            },
        });

        clearTimeout(timeoutId);

        // Check if response is a redirect (security concern)
        if (response.status >= 300 && response.status < 400) {
            return NextResponse.json({
                error: 'Redirects are not allowed'
            }, { status: 403 });
        }

        if (!response.ok) {
            return NextResponse.json({
                error: `Gat ekki sótt dagatal: ${response.status} ${response.statusText}`
            }, { status: response.status });
        }

        // SECURITY: Validate content type
        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.includes('text/calendar') && !contentType.includes('text/plain')) {
            return NextResponse.json({
                error: 'Invalid content type. Expected text/calendar or text/plain'
            }, { status: 400 });
        }

        // SECURITY: Check response size
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
            return NextResponse.json({
                error: 'Response too large'
            }, { status: 413 });
        }

        const text = await response.text();

        // SECURITY: Enforce size limit even if Content-Length wasn't set
        if (text.length > MAX_RESPONSE_SIZE) {
            return NextResponse.json({
                error: 'Response too large'
            }, { status: 413 });
        }

        // Validate it's actually ICS format (basic check)
        if (!text.includes('BEGIN:VCALENDAR')) {
            return NextResponse.json({
                error: 'Invalid calendar format'
            }, { status: 400 });
        }

        return new NextResponse(text, {
            status: 200,
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        });

    } catch (error: any) {
        // Handle timeout
        if (error.name === 'AbortError') {
            return NextResponse.json({
                error: 'Request timeout. Calendar server took too long to respond.'
            }, { status: 504 });
        }

        // Log error for monitoring (but don't expose internals to client)
        console.error('[SECURITY] Calendar proxy error:', {
            url: parsedUrl.hostname, // Log hostname only, not full URL
            error: error.message,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({
            error: 'Failed to fetch calendar. Please try again later.'
        }, { status: 500 });
    }
}
