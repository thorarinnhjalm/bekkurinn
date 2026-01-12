'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Calendar, CheckSquare, Megaphone, Home, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useClass } from '@/hooks/useFirestore';

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
                "hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 z-40",
                "bg-white/50 backdrop-blur-xl border-r border-white/20 shadow-lg", // V2 Glass Style
                className
            )}
        >
            {/* Logo Area */}
            <div className="p-8">
                <Link href={`/${locale}/dashboard`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nordic-blue to-nordic-blue-dark flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="8" cy="9" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
                            <circle cx="16" cy="9" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
                            <circle cx="12" cy="15" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
                        </svg>
                    </div>
                    <div>
                        <span className="font-bold text-xl block tracking-tight text-gray-900 group-hover:text-nordic-blue transition-colors">
                            Bekkurinn
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 font-medium">
                                Skólafélagið
                            </span>
                            {isVerified && (
                                <ShieldCheck size={12} className="text-green-600 fill-green-100" />
                            )}
                        </div>
                    </div>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-4 space-y-2">
                {navItems.map((item) => {
                    const fullPath = `/${locale}${item.href}`;
                    const isActive = pathname.startsWith(fullPath);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.key}
                            href={fullPath}
                            className={cn(
                                'flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden',
                                isActive
                                    ? 'text-nordic-blue font-bold shadow-sm bg-white'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'
                            )}
                        >
                            {/* Active Indicator Line */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-nordic-blue rounded-r-full" />
                            )}

                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={cn("transition-transform group-hover:scale-110", isActive && "text-nordic-blue")}
                            />
                            <span className="text-base">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Footer - Floating Glass Card */}
            <div className="p-4">
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        {user?.photoURL ? (
                            <Image
                                src={user.photoURL}
                                alt="Profile"
                                width={40}
                                height={40}
                                className="rounded-full ring-2 ring-white shadow-sm"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold border border-white shadow-inner">
                                {user?.email?.[0]?.toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 truncate">
                                {user?.displayName || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Link
                            href={`/${locale}/settings`}
                            className="flex items-center justify-center gap-2 p-2 rounded-xl hover:bg-white/50 text-xs font-medium text-gray-600 transition-colors"
                        >
                            <Settings size={14} />
                            Stillingar
                        </Link>
                        <button
                            onClick={() => signOut()}
                            className="flex items-center justify-center gap-2 p-2 rounded-xl hover:bg-red-50 text-xs font-medium text-red-600 transition-colors"
                        >
                            <LogOut size={14} />
                            Útskrá
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
