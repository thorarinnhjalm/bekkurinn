import { DesktopSidebar } from '@/components/navigation/DesktopSidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { TopHeader } from '@/components/navigation/TopHeader';
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
                {/* Top Header - Padding adjustment for desktop to account for sidebar handled by flex layout, 
                    but TopHeader is fixed so we might need to adjust it or wrap it.
                    Actually TopHeader is fixed: `fixed top-0 left-0 right-0`.
                    If we keep it fixed, it will overlay the sidebar or be underneath.
                    
                    Better approach for this "hybrid" layout:
                    Mobile: Fixed TopHeader + Content + Fixed BottomNav
                    Desktop: Fixed Sidebar + Content (maybe with TopHeader for just Search/Notifs?)
                    
                    Let's make TopHeader aware of desktop or just hide it on desktop if Sidebar covers it?
                    Sidebar covers navigation. TopHeader covers Logo + Notifs + User.
                    Sidebar has Logo + User. 
                    So on Desktop, TopHeader only provides "Notifications"? 
                    
                    Let's adjust TopHeader to be `md:pl-64` so it sits next to sidebar?
                    Or better, let's keep it simple: Use a wrapper for the main content area.
                */}

                {/* We need to handle the fixed positioning of TopHeader. 
                    If we want it to span the full width minus sidebar on desktop:
                    Add `md:left-64` to TopHeader.
                */}
                <div className="md:pl-64 w-full"> {/* Desktop spacer for fixed sidebar */}
                    <TopHeader className="md:left-64" />

                    <main className="flex-1 w-full max-w-7xl mx-auto pt-24 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8">
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </main>
                </div>
            </div>

            {/* Bottom Navigation */}
            <BottomNav
                locale={locale}
                translations={{
                    ...messages.class,
                    agreement: messages.agreement.title
                }}
            />

            {/* Testimonial Collection Prompt */}
            <ClientTestimonialPrompt />
        </div>
    );
}
