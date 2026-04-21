'use client';

import { X, User, Settings, LogOut, ShieldCheck, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import Image from 'next/image';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    locale: string;
    translations: {
        agreement: string;
        settings?: string;
        logout?: string;
        my_account?: string;
        class_settings?: string;
        menu?: string;
        user?: string;
    };
}

export function MobileDrawer({ isOpen, onClose, locale, translations }: MobileDrawerProps) {
    const { user, signOut } = useAuth();

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 md:hidden",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed right-0 top-0 bottom-0 z-[70] w-[280px] bg-surface-container-low shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
                    "flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-outline-variant/15">
                    <span className="font-bold text-lg text-primary">{translations.menu || 'Valmynd'}</span>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-surface-container transition-colors"
                    >
                        <X size={24} className="text-on-surface-variant" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
                    {/* User Section */}
                    {user && (
                        <div className="px-4 py-4 mb-4 bg-surface-container-low rounded-xl mx-2">
                            <div className="flex items-center gap-3">
                                {user.photoURL ? (
                                    <Image
                                        src={user.photoURL}
                                        alt={user.displayName || 'User'}
                                        width={48}
                                        height={48}
                                        className="rounded-full ring-2 ring-white"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xl">
                                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-on-surface truncate">
                                        {user.displayName || translations.user || 'Notandi'}
                                    </p>
                                    <p className="text-xs text-on-surface-variant truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Nav Items */}
                    <Link
                        href={`/${locale}/agreement`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-container-low transition-colors"
                    >
                        <ShieldCheck size={20} className="text-on-surface-variant" />
                        <span className="font-medium">{translations.agreement}</span>
                    </Link>

                    <div className="h-px bg-outline-variant/20 my-2 mx-4" />

                    <Link
                        href={`/${locale}/user/profile`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-container-low transition-colors"
                    >
                        <User size={20} className="text-on-surface-variant" />
                        <span className="font-medium">{translations.my_account || 'Reikningurinn minn'}</span>
                    </Link>

                    <Link
                        href={`/${locale}/settings`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-container-low transition-colors"
                    >
                        <Settings size={20} className="text-on-surface-variant" />
                        <span className="font-medium">{translations.class_settings || 'Stillingar bekkjar'}</span>
                    </Link>

                    <button
                        onClick={() => {
                            signOut();
                            onClose();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-error-container/40 text-error transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">{translations.logout || 'Skrá út'}</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-outline-variant/15">
                    <div className="flex items-center gap-2 text-outline">
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                <circle cx="16" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                <circle cx="12" cy="15" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            </svg>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider">Bekkurinn</span>
                    </div>
                </div>
            </div>
        </>
    );
}
