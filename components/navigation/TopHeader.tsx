'use client';

import { Bell, Settings, LogOut, User as UserIcon, Check, X, HelpCircle } from 'lucide-react';
import { AboutModal } from '@/components/ui/AboutModal';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { Timestamp } from 'firebase/firestore';
import { locales } from '@/i18n-config';

/**
 * Top Header - Logo, Notifications, Settings
 * 
 * Always visible at the top of the app
 */

export function TopHeader({ className }: { className?: string }) {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, createNotification, loading } = useNotifications();
    const params = useParams();
    const pathname = usePathname();
    // Default to 'is' if not found, but it should be available in app router
    const locale = params.locale || 'is';

    const handleSignOut = async () => {
        await signOut();
        setShowSettingsMenu(false);
    };

    const handleNotificationClick = async (id: string, link?: string) => {
        await markAsRead(id);
        if (link) {
            router.push(link);
            setShowNotifications(false);
        }
    };

    const sendTestNotification = async () => {
        if (!user) return;
        await createNotification(
            user.uid,
            'Velkomin(n) í Bekkinn!',
            'Þetta er prufu-tilkynning. Kerfið virkar!',
            'system'
        );
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-30 border-b transition-all duration-200 bg-white/90 backdrop-blur-md ${className || ''}`}
                style={{
                    borderColor: 'var(--border-light)',
                    paddingTop: 'env(safe-area-inset-top, 0px)',
                }}
            >
                <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto w-full">
                    {/* Logo - Hidden on desktop as it's in the sidebar */}
                    <Link href={user ? `/${locale}/dashboard` : '/'} className="flex items-center gap-2 md:opacity-0 md:pointer-events-none">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--nordic-blue)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="9" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
                                <circle cx="16" cy="9" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
                                <circle cx="12" cy="15" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg" style={{ color: 'var(--nordic-blue)' }}>
                            Bekkurinn
                        </span>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Help Button */}
                        <button
                            onClick={() => setShowAbout(true)}
                            className="tap-target p-2 rounded-lg hover:bg-stone-100 text-gray-500 hover:text-nordic-blue transition-colors"
                            title="Hvað er þetta?"
                        >
                            <HelpCircle size={20} />
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative tap-target p-2 rounded-lg"
                                style={{
                                    backgroundColor: showNotifications ? 'var(--nordic-blue-light)' : 'var(--gray-100)',
                                    color: showNotifications ? 'white' : 'inherit'
                                }}
                            >
                                <Bell size={20} style={{ color: showNotifications ? 'white' : 'var(--text-primary)' }} />
                                {unreadCount > 0 && (
                                    <div
                                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                        style={{
                                            backgroundColor: 'var(--amber)',
                                            color: 'white'
                                        }}
                                    >
                                        {unreadCount}
                                    </div>
                                )}
                            </button>

                            {showNotifications && (
                                <div
                                    className="absolute right-0 mt-2 w-80 nordic-card shadow-lg z-50 overflow-hidden max-h-[80vh] flex flex-col bg-white"
                                >
                                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                        <h3 className="font-semibold text-sm">Tilkynningar</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={() => markAllAsRead()}
                                                className="text-[11px] font-bold text-nordic-blue hover:text-nordic-blue-dark transition-colors uppercase tracking-wider"
                                            >
                                                Lesa allt
                                            </button>
                                        )}
                                    </div>

                                    <div className="overflow-y-auto max-h-[60vh]">
                                        {notifications.length > 0 ? (
                                            <div className="divide-y divide-gray-50">
                                                {notifications.map((n) => (
                                                    <button
                                                        key={n.id}
                                                        onClick={() => handleNotificationClick(n.id, n.link)}
                                                        className={`w-full text-left p-4 hover:bg-stone-50 transition-colors flex gap-3 items-start relative ${!n.read ? 'bg-blue-50/30' : ''}`}
                                                    >
                                                        {!n.read && (
                                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-nordic-blue" />
                                                        )}
                                                        <div className="flex-1">
                                                            <p className={`text-sm leading-snug mb-1 ${!n.read ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                                                {n.title}
                                                            </p>
                                                            <p className="text-xs text-gray-400 line-clamp-2">
                                                                {n.message}
                                                            </p>
                                                            {n.createdAt && (
                                                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium">
                                                                    {n.createdAt.toDate().toLocaleDateString('is-IS', { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 flex flex-col items-center justify-center text-center text-gray-500">
                                                <Bell size={32} className="mb-2 opacity-20" />
                                                <p className="text-sm">Engar nýjar tilkynningar</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User / Settings */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                                    className="tap-target p-1 rounded-lg"
                                    style={{
                                        backgroundColor: 'var(--gray-100)',
                                    }}
                                >
                                    {user.photoURL ? (
                                        <Image
                                            src={user.photoURL}
                                            alt={user.displayName || 'User'}
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                            style={{ backgroundColor: 'var(--nordic-blue)', color: 'white' }}
                                        >
                                            {(user.displayName || user.email || 'U')[0].toUpperCase()}
                                        </div>
                                    )}
                                </button>

                                {/* Settings Dropdown */}
                                {showSettingsMenu && (
                                    <div
                                        className="absolute right-0 mt-2 w-48 nordic-card py-2 shadow-lg"
                                        onMouseLeave={() => setShowSettingsMenu(false)}
                                    >
                                        <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
                                            <p className="font-medium text-sm truncate">{user.displayName || user.email}</p>
                                            <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{user.email}</p>
                                        </div>

                                        <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
                                            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>Tungumál / Language</p>
                                            <div className="flex items-center gap-2">
                                                {locales.map((l) => (
                                                    <Link
                                                        key={l}
                                                        href={`/${l}${pathname ? pathname.replace(/^\/[a-z]{2}/, '') : ''}`}
                                                        className={`px-2 py-1 text-xs rounded border ${locale === l
                                                            ? 'bg-nordic-blue text-white border-nordic-blue'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                            }`}
                                                        onClick={() => setShowSettingsMenu(false)}
                                                    >
                                                        {l.toUpperCase()}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>

                                        <Link
                                            href={`/${locale}/user/profile`}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-opacity-50 transition-colors"
                                            style={{ color: 'var(--text-primary)' }}
                                            onClick={() => setShowSettingsMenu(false)}
                                        >
                                            <UserIcon size={16} />
                                            <span>Minn Aðgangur</span>
                                        </Link>

                                        <Link
                                            href={`/${locale}/settings`}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-opacity-50 transition-colors"
                                            style={{ color: 'var(--text-primary)' }}
                                            onClick={() => setShowSettingsMenu(false)}
                                        >
                                            <Settings size={16} />
                                            <span>Stillingar Bekkjar</span>
                                        </Link>

                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-opacity-50 transition-colors border-t"
                                            style={{ color: 'var(--red)', borderColor: 'var(--border-light)' }}
                                        >
                                            <LogOut size={16} />
                                            <span>Útskráning</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                {/* Language Switcher for non-logged in users */}
                                <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
                                    {locales.map((l) => (
                                        <Link
                                            key={l}
                                            href={`/${l}${pathname ? pathname.replace(/^\/[a-z]{2}/, '') : ''}`}
                                            className={`px-2 py-1 text-xs rounded font-medium transition-colors ${locale === l
                                                ? 'bg-white text-nordic-blue shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {l.toUpperCase()}
                                        </Link>
                                    ))}
                                </div>
                                <button
                                    className="tap-target p-2 rounded-lg"
                                    style={{
                                        backgroundColor: 'var(--gray-100)',
                                    }}
                                >
                                    <Settings size={20} style={{ color: 'var(--text-primary)' }} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </header>

            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
        </>
    );
}
