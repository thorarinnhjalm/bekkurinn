import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n-config';

export default createMiddleware({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale,

    // Disable automatic locale detection based on Accept-Language header
    localeDetection: false
});

export const config = {
    // Match only internationalized pathnames
    // Skip all paths that should not be internationalized
    matcher: ['/((?!api|_next|.*\\..*).*)']
};
