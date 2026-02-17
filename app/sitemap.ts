import { MetadataRoute } from 'next';
import { locales } from '@/i18n-config';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://bekkurinn.is';

    // Static routes that exist for every locale
    const routes = [
        '', // Landing page
        '/bekkjarsattmali',
        '/foreldrarolt',
        '/samanburdur',
        // Add public routes later as they are built (e.g. /about, /privacy)
    ];

    // Generate entries for each locale
    const localeEntries = locales.flatMap((locale) =>
        routes.map(route => ({
            url: `${baseUrl}/${locale}${route}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: route === '' ? 0.9 : 0.8,
        }))
    );

    // Root landing page (Icelandic default)
    const rootEntry = {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 1,
    };

    return [
        rootEntry,
        ...localeEntries
    ];
}
