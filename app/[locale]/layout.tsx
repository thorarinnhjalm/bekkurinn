import { ReactNode } from 'react';

import { notFound } from 'next/navigation';
import { locales } from '@/i18n-config';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';

/**
 * Locale Layout
 * Provides messages, React Query, and Authentication for the specific locale
 */

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
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



    return (
        <QueryProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </QueryProvider>
    );
}
