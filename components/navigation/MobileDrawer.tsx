'use client';

import { X, User, Settings, LogOut, ShieldCheck, Car, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import Image from 'next/image';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    locale: string;
    translations: {
        skutl: string;
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
                    "fixed right-0 top-0 bottom-0 z-[70] w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
                    "flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="font-bold text-lg text-trust-navy">{translations.menu || 'Valmynd'}</span>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
                    {/* User Section */}
                    {user && (
                        <div className="px-4 py-4 mb-4 bg-gray-50 rounded-xl mx-2">
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
                                    <div className="w-12 h-12 rounded-full bg-trust-navy flex items-center justify-center text-white font-bold text-xl">
                                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-gray-900 truncate">
                                        {user.displayName || translations.user || 'Notandi'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Nav Items */}
                    <Link
                        href={`/${locale}/pickup-offers`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Car size={20} className="text-gray-600" />
                        <span className="font-medium">{translations.skutl}</span>
                    </Link>

                    <Link
                        href={`/${locale}/agreement`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ShieldCheck size={20} className="text-gray-600" />
                        <span className="font-medium">{translations.agreement}</span>
                    </Link>

                    <div className="h-px bg-gray-100 my-2 mx-4" />

                    <Link
                        href={`/${locale}/user/profile`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <User size={20} className="text-gray-600" />
                        <span className="font-medium">{translations.my_account || 'Reikningurinn minn'}</span>
                    </Link>

                    <Link
                        href={`/${locale}/settings`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Settings size={20} className="text-gray-600" />
                        <span className="font-medium">{translations.class_settings || 'Stillingar bekkjar'}</span>
                    </Link>

                    <button
                        onClick={() => {
                            signOut();
                            onClose();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">{translations.logout || 'Skrá út'}</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
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
