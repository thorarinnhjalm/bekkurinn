import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Supported languages for Bekkurinn
export const locales = ['en', 'is', 'pl', 'es'] as const;
export type Locale = (typeof locales)[number];

// Default language is English (hardcoded in UI, others via translation files)
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Validate that the incoming locale parameter is valid
    if (!locale || !locales.includes(locale as Locale)) {
        locale = defaultLocale;
    }

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default,
    };
});
