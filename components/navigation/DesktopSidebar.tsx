'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Users, Settings, LogOut, CheckSquare, Megaphone, ShieldCheck, Calendar, Camera, Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useClass } from '@/hooks/useFirestore';
import { locales } from '@/i18n-config';

interface DesktopSidebarProps {
    className?: string;
    locale: string;
    translations: {
        home: string;
        directory: string;
        patrol: string;
        tasks: string;
        announcements: string;
        lost_found: string;
        skutl: string;
        agreement: string;
        settings?: string;
        logout?: string;
    };
}

export function DesktopSidebar({ className, locale, translations }: DesktopSidebarProps) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    // Fetch Class for Verified Badge
    const [classId, setClassId] = useState<string | null>(null);
    useEffect(() => {
        async function fetchUserClass() {
            if (!user) return;
            try {
                // Try finding class where user is admin first (most likely scenario for setup)
                // Or checking a parent link? For now, we reuse the pattern: find class user is admin of.
                // NOTE: This logic is simplified; real app needs a "Current Class Context".
                const q = query(
                    collection(db, 'classes'),
                    where('admins', 'array-contains', user.uid),
                    limit(1)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    setClassId(snapshot.docs[0].id);
                } else {
                    // Fallback: Find class via ParentLink? (Omitted for brevity in this task)
                }
            } catch (error) {
                console.error(error);
            }
        }
        if (user) fetchUserClass();
    }, [user]);

    const { data: classData } = useClass(classId);
    const isVerified = Boolean(classData?.schoolId);

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
            key: 'tasks',
            href: '/calendar',
            icon: Calendar,
            label: translations.tasks, // Maps to "Dagatal" now
        },
        {
            key: 'announcements',
            href: '/announcements',
            icon: Megaphone,
            label: translations.announcements,
        },
        {
            key: 'lost-found',
            href: '/lost-found',
            icon: Camera,
            label: translations.lost_found,
        },
        {
            key: 'pickup-offers',
            href: '/pickup-offers',
            icon: Car,
            label: translations.skutl,
        },
        {
            key: 'agreement',
            href: '/agreement',
            icon: ShieldCheck,
            label: translations.agreement,
        },
    ] as const;

    return (
        <aside
            className={cn(
                "hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 z-40",
                "bg-white border-r border-gray-200 shadow-sm",
                className
            )}
        >
            {/* Logo Area */}
            <div className="p-6 border-b border-gray-100">
                <Link href={`/${locale}/dashboard`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-blue-900 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="8" cy="9" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
                            <circle cx="16" cy="9" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
                            <circle cx="12" cy="15" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
                        </svg>
                    </div>
                    <div>
                        <span className="font-bold text-xl block tracking-tight text-gray-900">
                            Bekkurinn
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 font-medium">
                                Skólafélagið
                            </span>
                            {isVerified && (
                                <ShieldCheck size={12} className="text-green-600" />
                            )}
                        </div>
                    </div>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {navItems.map((item) => {
                    const fullPath = `/${locale}${item.href}`;
                    const isActive = pathname.startsWith(fullPath);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.key}
                            href={fullPath}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                                isActive
                                    ? 'text-blue-900 font-semibold bg-gray-50 border-l-2 border-blue-900'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            )}
                        >
                            <Icon
                                size={20}
                                strokeWidth={isActive ? 2.5 : 2}
                                className="flex-shrink-0"
                            />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Footer */}
            <div className="p-4 border-t border-gray-100">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                        {user?.photoURL ? (
                            <Image
                                src={user.photoURL}
                                alt="Profile"
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                                {user?.email?.[0]?.toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                                {user?.displayName || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <Link
                            href={`/${locale}/settings`}
                            className="flex items-center justify-center gap-1.5 p-2 rounded-md hover:bg-gray-100 text-xs font-medium text-gray-700 transition-colors"
                        >
                            <Settings size={14} />
                            {translations.settings || 'Settings'}
                        </Link>
                        <button
                            onClick={() => signOut()}
                            className="flex items-center justify-center gap-1.5 p-2 rounded-md hover:bg-red-50 text-xs font-medium text-red-600 transition-colors"
                        >
                            <LogOut size={14} />
                            {translations.logout || 'Sign Out'}
                        </button>
                    </div>

                </div>
            </div>
        </aside>
    );
}
