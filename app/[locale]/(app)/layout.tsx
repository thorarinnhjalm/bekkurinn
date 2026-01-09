import { BottomNav } from '@/components/navigation/BottomNav';
import { TopHeader } from '@/components/navigation/TopHeader';
import { ErrorBoundary } from '@/components/ErrorBoundary';

/**
 * App Layout - Wrapper for authenticated app sections
 * 
 * This layout adds the top header and bottom navigation bar
 * to all app routes (directory, patrol, tasks, announcements)
 */

export default async function AppLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const messages = (await import(`@/messages/${locale}.json`)).default;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Top Header */}
            <TopHeader />

            {/* Main content area with top and bottom padding */}
            <main className="flex-1 w-full max-w-5xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:px-8">
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
            </main>

            {/* Bottom Navigation */}
            <BottomNav locale={locale} translations={messages.class} />
        </div>
    );
}
