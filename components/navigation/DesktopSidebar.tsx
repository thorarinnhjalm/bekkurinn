'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Calendar, CheckSquare, Megaphone, Home, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';

interface DesktopSidebarProps {
    className?: string;
    locale: string;
    translations: {
        home: string;
        directory: string;
        patrol: string;
        tasks: string;
        announcements: string;
    };
}

export function DesktopSidebar({ className, locale, translations }: DesktopSidebarProps) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const navItems = [
        {
            key: 'dashboard',
            href: '/dashboard',
            icon: Home,
            label: translations.home,
        },
        {
            key: 'directory',
            href: '/directory',
            icon: Users,
            label: translations.directory,
        },
        {
            key: 'patrol',
            href: '/patrol',
            icon: Calendar,
            label: translations.patrol,
        },
        {
            key: 'tasks',
            href: '/tasks',
            icon: CheckSquare,
            label: translations.tasks,
        },
        {
            key: 'announcements',
            href: '/announcements',
            icon: Megaphone,
            label: translations.announcements,
        },
    ] as const;

    return (
        <aside
            className={cn(
                "hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r z-40 bg-white",
                className
            )}
            style={{ borderColor: 'var(--border-light)' }}
        >
            {/* Logo Area */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
                <Link href={`/${locale}/dashboard`} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--nordic-blue)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="8" cy="9" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
                            <circle cx="16" cy="9" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
                            <circle cx="12" cy="15" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
                        </svg>
                    </div>
                    <div>
                        <span className="font-bold text-xl block" style={{ color: 'var(--nordic-blue)' }}>
                            Bekkurinn
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                            Skólafélagið
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const fullPath = `/${locale}${item.href}`;
                    const isActive = pathname.startsWith(fullPath);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.key}
                            href={fullPath}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                                isActive
                                    ? 'shadow-sm font-medium'
                                    : 'hover:bg-gray-50'
                            )}
                            style={{
                                backgroundColor: isActive ? 'var(--bg-secondary)' : 'transparent',
                                color: isActive ? 'var(--nordic-blue)' : 'var(--text-secondary)',
                            }}
                        >
                            <Icon
                                size={20}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={cn(
                                    "transition-colors",
                                    isActive ? "text-nordic-blue" : "text-gray-400 group-hover:text-gray-600"
                                )}
                            />
                            <span>{item.label}</span>

                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-nordic-blue" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Footer */}
            <div className="p-4 border-t bg-gray-50" style={{ borderColor: 'var(--border-light)' }}>
                {user ? (
                    <div className="space-y-4">
                        <Link
                            href={`/${locale}/user/profile`}
                            className="flex items-center gap-3 hover:bg-white p-2 rounded-lg transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm"
                        >
                            {user.photoURL ? (
                                <Image
                                    src={user.photoURL}
                                    alt={user.displayName || 'User'}
                                    width={40}
                                    height={40}
                                    className="rounded-full shadow-sm"
                                />
                            ) : (
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm"
                                    style={{ backgroundColor: 'white', color: 'var(--nordic-blue)', border: '1px solid var(--border-light)' }}
                                >
                                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-gray-900">
                                    {user.displayName || 'Notandi'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    Skoða prófíl
                                </p>
                            </div>
                        </Link>

                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                href={`/${locale}/settings`}
                                className="flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
                            >
                                <Settings size={14} />
                                <span>Stillingar</span>
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className="flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100 transition-all"
                            >
                                <LogOut size={14} />
                                <span>Útskráning</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <Link href={`/${locale}/login`} className="nordic-button w-full justify-center text-sm py-2">
                            Skrá inn
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
}
