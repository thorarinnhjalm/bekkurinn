import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n-config';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastContainer } from '@/components/ui/Toast';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import StructuredData from '@/components/StructuredData';

/**
 * Locale Layout
 * Provides messages, React Query, Authentication, Error Handling, and Toast Notifications
 */

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    // Simple localization of metadata based on locale
    const titles: Record<string, string> = {
        is: 'Bekkurinn - Allt sem bekkurinn þarf',
        en: 'Bekkurinn - Everything your class needs',
        pl: 'Bekkurinn - Wszystko, czego potrzebuje Twoja klasa',
        lt: 'Bekkurinn - Viskas, ko reikia klasei'
    };

    const descriptions: Record<string, string> = {
        is: 'Fullkomið kerfi fyrir bekkjarfulltrúa og foreldra. Haltu utan um foreldrarölt, bekkjarsáttmála, viðburði og tengiliði á einum stað. Einfalt, öruggt og frítt.',
        en: 'Simple, secure, and convenient system for class representatives and parents. Patrol, events, and contacts in one place.',
        pl: 'Prosty, bezpieczny i wygodny system dla przedstawicieli klas i rodziców. Patrole, wydarzenia i kontakty w jednym miejscu.',
        lt: 'Paprasta, saugi ir patogi sistema klasės atstovams ir tėvams. Patruliavimas, renginiai ir kontaktai vienoje vietoje.'
    };

    return {
        metadataBase: new URL('https://bekkurinn.is'),
        alternates: {
            canonical: `/${locale}`,
            languages: {
                'en': '/en',
                'is': '/is',
                'pl': '/pl',
                'es': '/es',
                'lt': '/lt',
                'tl': '/tl',
                'uk': '/uk',
                'vi': '/vi',
            },
        },
        title: {
            template: '%s | Bekkurinn',
            default: titles[locale] || titles['is'],
        },
        description: descriptions[locale] || descriptions['is'],
        openGraph: {
            title: titles[locale] || titles['is'],
            description: descriptions[locale] || descriptions['is'],
            url: 'https://bekkurinn.is',
            siteName: 'Bekkurinn',
            locale: locale,
            type: 'website',
        },
        keywords: ['bekkjarfulltrúi', 'skóli', 'rölt', 'foreldrastarf', 'bekkurinn', 'class representative', 'school app'],
        manifest: '/manifest.json',
        appleWebApp: {
            capable: true,
            statusBarStyle: 'default',
            title: 'Bekkurinn',
        },
        formatDetection: {
            telephone: false,
        },
    };
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Validate locale
    if (!locales.includes(locale as any)) {
        notFound();
    }

    // Now that next-intl plugin is properly configured in next.config.ts,
    // getMessages() should work correctly
    const messages = await getMessages();

    return (
        <ErrorBoundary>
            <QueryProvider>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <AuthProvider>
                        <StructuredData locale={locale} />
                        {children}
                        <ToastContainer />
                    </AuthProvider>
                </NextIntlClientProvider>
            </QueryProvider>
        </ErrorBoundary>
    );
}
