import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Check if pathname is missing locale
    const pathnameIsMissingLocale = ['/is', '/en', '/pl', '/es'].every(
        (locale) => !pathname.startsWith(locale) && pathname !== locale
    );

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = 'is'; // Default locale
        // e.g. incoming request is /dashboard
        // The new URL is now /is/dashboard
        return NextResponse.redirect(
            new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
        );
    }

    return NextResponse.next();
}

export const config = {
    // Matcher excluding api, static files, etc.
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
