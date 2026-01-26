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
        icon: Calendar,
        labelKey: 'class.tasks',
    },
    {
        key: 'announcements',
        href: '/announcements',
        icon: Megaphone,
        labelKey: 'class.announcements',
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
        more?: string;
    };
    onMenuToggle: () => void;
}

export function BottomNav({ locale, translations, onMenuToggle }: BottomNavProps) {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden"
            style={{
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
        >
            <div className="flex items-center justify-around px-1 py-2">
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
                                'px-2 py-2 min-w-[60px] relative',
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
                                    'text-[10px] transition-all whitespace-nowrap',
                                    isActive ? 'font-semibold' : 'font-medium'
                                )}
                            >
                                {translations[item.key as keyof typeof translations] || item.key}
                            </span>

                            {/* Active indicator */}
                            {isActive && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-10 bg-trust-navy rounded-t-sm" />
                            )}
                        </Link>
                    );
                })}

                {/* More Button */}
                <button
                    onClick={onMenuToggle}
                    className={cn(
                        'flex flex-col items-center justify-center gap-1',
                        'rounded-lg transition-colors duration-200',
                        'px-2 py-2 min-w-[60px] text-gray-500 hover:text-trust-navy'
                    )}
                >
                    <Menu size={22} strokeWidth={2} />
                    <span className="text-[10px] font-medium transition-all">
                        {translations.more || 'Meira'}
                    </span>
                </button>
            </div>
        </nav>
    );
}
