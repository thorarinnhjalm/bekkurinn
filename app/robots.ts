import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/_next/', '/*/login', '/*/onboarding'],
        },
        sitemap: 'https://www.bekkurinn.is/sitemap.xml',
    };
}
