import { BottomNav } from '@/components/navigation/BottomNav';
import { TopHeader } from '@/components/navigation/TopHeader';

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
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>

            {/* Bottom Navigation */}
            <BottomNav translations={messages.class} />
        </div>
    );
}
