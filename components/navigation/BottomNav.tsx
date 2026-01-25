'use client';


import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, Calendar, Megaphone, Menu, Camera, Car, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Bottom Navigation Bar - Mobile First
 * 
 * 4 Main Tabs:
 * - Directory (Skrá) - Class contacts and students
 * - Patrol (Röltið) - Neighborhood patrol scheduling
 * - Tasks (Reddingar) - Events and logistics
 * - Announcements (Auglýsingataflan) - The Fridge
 * 
 * Design: 44px+ tap targets, Nordic Trust colors
 */

const navItems = [
    {
        key: 'dashboard',
        href: '/dashboard',
        icon: Home,
        labelKey: 'class.home',
    },
    {
        key: 'directory',
        href: '/directory',
        icon: Users,
        labelKey: 'class.directory',
    },
    {
        key: 'tasks',
        href: '/calendar',
        icon: Calendar, // Changed icon to Calendar
        labelKey: 'class.tasks',
    },
    {
        key: 'announcements',
        href: '/announcements',
        icon: Megaphone,
        labelKey: 'class.announcements',
    },
    {
        key: 'skutl',
        href: '/pickup-offers',
        icon: Car,
        labelKey: 'class.skutl',
    },
    {
        key: 'agreement',
        href: '/agreement',
        icon: ShieldCheck,
        labelKey: 'agreement.title',
    },
] as const;

interface BottomNavProps {
    locale: string;
    translations: {
        home: string;
        directory: string;
        patrol: string;
        tasks: string;
        announcements: string;
        agreement: string;
    };
}

export function BottomNav({ locale, translations }: BottomNavProps) {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden"
            style={{
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
        >
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => {
                    // Construct the full path with locale
                    const fullPath = `/${locale}${item.href}`;
                    const isActive = pathname.startsWith(fullPath);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.key}
                            href={fullPath}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1',
                                'rounded-lg transition-colors duration-200',
                                'px-3 py-2 min-w-[64px]',
                                isActive
                                    ? 'text-trust-navy'
                                    : 'text-gray-500'
                            )}
                        >
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span
                                className={cn(
                                    'text-xs transition-all',
                                    isActive ? 'font-semibold' : 'font-medium'
                                )}
                            >
                                {translations[item.key as keyof typeof translations] || (item.key === 'skutl' ? 'Skutl' : item.key)}
                            </span>

                            {/* Active indicator */}
                            {isActive && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-12 bg-trust-navy rounded-t-sm" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
