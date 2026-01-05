import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { locales, defaultLocale, type Locale } from './i18n-config';

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
