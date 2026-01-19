'use client';


import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, Calendar, Megaphone, Menu, Camera, Car } from 'lucide-react';
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
        labelKey: 'class.skutl', // Will fallback to key
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
    };
}

export function BottomNav({ locale, translations }: BottomNavProps) {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 border-t md:hidden"
            style={{
                backgroundColor: 'var(--white)',
                borderColor: 'var(--border-light)',
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
                                'tap-target rounded-lg transition-all duration-200',
                                'px-4 py-2 min-w-[64px]',
                                isActive ? 'scale-105' : 'opacity-60 hover:opacity-100'
                            )}
                            style={{
                                color: isActive ? 'var(--nordic-blue)' : 'var(--text-secondary)',
                            }}
                        >
                            <Icon
                                size={24}
                                strokeWidth={isActive ? 2.5 : 2}
                                className="transition-transform"
                            />
                            <span
                                className={cn(
                                    'text-xs font-medium transition-all',
                                    isActive ? 'font-semibold' : ''
                                )}
                            >
                                {translations[item.key as keyof typeof translations] || (item.key === 'skutl' ? 'Skutl' : item.key)}
                            </span>

                            {/* Active indicator */}
                            {isActive && (
                                <div
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-8 rounded-t-full"
                                    style={{ backgroundColor: 'var(--nordic-blue)' }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
