import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n-config';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastContainer } from '@/components/ui/Toast';
// import { setRequestLocale } from 'next-intl/server'; // Removed to reduce complexity
import { NextIntlClientProvider } from 'next-intl';
import { Metadata } from 'next';

/**
 * Locale Layout
 * Provides messages, React Query, Authentication, Error Handling, and Toast Notifications
 */

// export function generateStaticParams() {
//    return locales.map((locale) => ({ locale }));
// }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    // setRequestLocale(locale);

    // Simple localization of metadata based on locale
    const titles: Record<string, string> = {
        is: 'Bekkurinn - Allt sem bekkurinn þarf',
        en: 'Bekkurinn - Everything your class needs',
        pl: 'Bekkurinn - Wszystko, czego potrzebuje Twoja klasa',
        lt: 'Bekkurinn - Viskas, ko reikia klasei'
    };

    const descriptions: Record<string, string> = {
        is: 'Einfalt, öruggt og þægilegt kerfi fyrir bekkjarfulltrúa og foreldra. Rölt, viðburðir og tengiliðir á einum stað.',
        en: 'Simple, secure, and convenient system for class representatives and parents. Patrol, events, and contacts in one place.',
        pl: 'Prosty, bezpieczny i wygodny system dla przedstawicieli klas i rodziców. Patrole, wydarzenia i kontakty w jednym miejscu.',
        lt: 'Paprasta, saugi ir patogi sistema klasės atstovams ir tėvams. Patruliavimas, renginiai ir kontaktai vienoje vietoje.'
    };

    return {
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
    };
}

async function getMessages(locale: string) {
    try {
        // Dynamically import the locale JSON file
        // Note: The path must be relative to this file or absolute alias
        // We use a relative path here assuming layout is in app/[locale] and messages is in root/messages
        return (await import(`../../messages/${locale}.json`)).default;
    } catch (error) {
        console.error(`Failed to load messages for locale: ${locale}`, error);
        // Fallback to English if locale not found
        try {
            return (await import(`../../messages/en.json`)).default;
        } catch (e) {
            return {}; // Last resort fallback
        }
    }
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    // setRequestLocale(locale);

    // Validate locale
    if (!locales.includes(locale as any)) {
        notFound();
    }

    // Hand-rolled message fetching to avoid next-intl configuration issues on Vercel
    const messages = await getMessages(locale);

    return (
        <ErrorBoundary>
            <QueryProvider>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <AuthProvider>
                        {children}
                        <ToastContainer />
                    </AuthProvider>
                </NextIntlClientProvider>
            </QueryProvider>
        </ErrorBoundary>
    );
}
