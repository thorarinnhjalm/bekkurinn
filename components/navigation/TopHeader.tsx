'use client';

import { Bell, Settings, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Top Header - Logo, Notifications, Settings
 * 
 * Always visible at the top of the app
 */

export function TopHeader() {
    const unreadNotifications = 3; // Mock data

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

                    {/* Settings */}
                    <button
                        className="tap-target p-2 rounded-lg"
                        style={{
                            backgroundColor: 'var(--stone)',
                        }}
                    >
                        <Settings size={20} style={{ color: 'var(--text-primary)' }} />
                    </button>
                </div>
            </div>
        </header>
    );
}
