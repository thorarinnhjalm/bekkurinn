import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { TopHeader } from '@/components/navigation/TopHeader';
import { MobileNavWrapper } from '@/components/navigation/MobileNavWrapper';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ClientTestimonialPrompt } from '@/components/ClientTestimonialPrompt';

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
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Desktop Sidebar (hidden on mobile) */}
            <DesktopSidebar
                className="hidden md:flex"
                locale={locale}
                translations={{
                    ...messages.class,
                    agreement: messages.agreement.title,
                    logout: messages.admin.logout,
                    settings: messages.admin.settings_link
                }}
            />

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="md:pl-64 w-full"> {/* Desktop spacer for fixed sidebar */}
                    <TopHeader className="md:left-64" />

                    <main className="flex-1 w-full max-w-7xl mx-auto pt-24 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8">
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </main>
                </div>
            </div>

            {/* Mobile Navigation Wrapper (BottomNav + Drawer) */}
            <MobileNavWrapper
                locale={locale}
                translations={{
                    ...messages.class,
                    ...messages.navigation,
                    agreement: messages.agreement.title
                }}
            />

            {/* Testimonial Collection Prompt */}
            <ClientTestimonialPrompt />
        </div>
    );
}
