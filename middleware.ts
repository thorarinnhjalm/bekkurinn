import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n-config';
import { closedPageRedirect, isClosedApi } from './lib/closedRoutes';

const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale,

    // Always use a locale prefix for URLs (e.g. /is/handbok)
    localePrefix: 'always',

    // Disable automatic locale detection based on Accept-Language header
    // This ensures Icelandic is the default even if the user's browser is in English
    localeDetection: false
});

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Gamla forritið er lokað: öll API svara 410 (sjá lib/closedRoutes.ts).
    if (isClosedApi(pathname)) {
        return NextResponse.json(
            { error: 'Þessari þjónustu hefur verið lokað.' },
            { status: 410, headers: { 'Cache-Control': 'no-store' } }
        );
    }

    // Innskráning, nýskráning og app-leiðir vísa á forsíðuna. Tímabundin
    // tilvísun (307) og fyrirspurnarstrengur (boðskóðar, returnTo) er felldur niður.
    const target = closedPageRedirect(pathname);
    if (target) {
        return NextResponse.redirect(new URL(target, request.url), 307);
    }

    return intlMiddleware(request);
}

export const config = {
    matcher: [
        // Enable a redirect to a matching locale at the root
        '/',

        // Set a cookie to remember the previous locale for
        // all requests that have a locale prefix
        '/(is|en|pl|es|lt|tl|uk|vi)/:path*',

        // Lokuð API: middleware svarar 410 áður en leiðin sjálf keyrir
        '/api/:path*',

        // Enable redirects that add missing locales
        // (e.g. `/pathnames` -> `/en/pathnames`)
        '/((?!api|_next|_vercel|.*\\..*).*)'
    ]
};
