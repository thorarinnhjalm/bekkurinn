'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Users, Calendar, CheckSquare, Megaphone } from 'lucide-react';
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
        key: 'directory',
        href: '/directory',
        icon: Users,
        labelKey: 'class.directory',
    },
    {
        key: 'patrol',
        href: '/patrol',
        icon: Calendar,
        labelKey: 'class.patrol',
    },
    {
        key: 'tasks',
        href: '/tasks',
        icon: CheckSquare,
        labelKey: 'class.tasks',
    },
    {
        key: 'announcements',
        href: '/announcements',
        icon: Megaphone,
        labelKey: 'class.announcements',
    },
] as const;

export function BottomNav() {
    const t = useTranslations();
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 border-t"
            style={{
                backgroundColor: 'var(--white)',
                borderColor: 'var(--border-light)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
        >
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1',
                                'tap-target rounded-lg transition-all duration-200',
                                'px-4 py-2 min-w-[64px]',
                                isActive ? 'scale-105' : 'opacity-60 hover:opacity-100'
                            )}
                            style={{
                                color: isActive ? 'var(--sage-green)' : 'var(--text-secondary)',
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
                                {t(item.labelKey)}
                            </span>

                            {/* Active indicator */}
                            {isActive && (
                                <div
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-8 rounded-t-full"
                                    style={{ backgroundColor: 'var(--sage-green)' }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
