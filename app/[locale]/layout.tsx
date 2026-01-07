import { ReactNode } from 'react';

import { notFound } from 'next/navigation';
import { locales } from '@/i18n-config';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastContainer } from '@/components/ui/Toast';

/**
 * Locale Layout
 * Provides messages, React Query, Authentication, Error Handling, and Toast Notifications
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
        <ErrorBoundary>
            <QueryProvider>
                <AuthProvider>
                    {children}
                    <ToastContainer />
                </AuthProvider>
            </QueryProvider>
        </ErrorBoundary>
    );
}
