'use client';

import { Bell, Settings, LogOut, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState } from 'react';

/**
 * Top Header - Logo, Notifications, Settings
 * 
 * Always visible at the top of the app
 */

export function TopHeader() {
    const { user, signOut } = useAuth();
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const unreadNotifications = 3; // Mock data

    const handleSignOut = async () => {
        await signOut();
        setShowSettingsMenu(false);
    };

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 border-b"
            style={{
                backgroundColor: 'var(--white)',
                borderColor: 'var(--border-light)',
                paddingTop: 'env(safe-area-inset-top, 0px)',
            }}
        >
            <div className="flex items-center justify-between px-4 py-3">
                {/* Logo */}
                <Link href="/directory" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--sage-green)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="8" cy="9" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
                            <circle cx="16" cy="9" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
                            <circle cx="12" cy="15" r="3.5" stroke="white" strokeWidth="1.5" fill="none" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg" style={{ color: 'var(--sage-green)' }}>
                        Bekkurinn
                    </span>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <button
                        className="relative tap-target p-2 rounded-lg"
                        style={{
                            backgroundColor: 'var(--stone)',
                        }}
                    >
                        <Bell size={20} style={{ color: 'var(--text-primary)' }} />
                        {unreadNotifications > 0 && (
                            <div
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                style={{
                                    backgroundColor: 'var(--amber)',
                                    color: 'white'
                                }}
                            >
                                {unreadNotifications}
                            </div>
                        )}
                    </button>

                    {/* User / Settings */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                                className="tap-target p-1 rounded-lg"
                                style={{
                                    backgroundColor: 'var(--stone)',
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
                                        style={{ backgroundColor: 'var(--sage-green)', color: 'white' }}
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
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-opacity-50 transition-colors"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        <LogOut size={16} />
                                        <span>Útskráning</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            className="tap-target p-2 rounded-lg"
                            style={{
                                backgroundColor: 'var(--stone)',
                            }}
                        >
                            <Settings size={20} style={{ color: 'var(--text-primary)' }} />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
