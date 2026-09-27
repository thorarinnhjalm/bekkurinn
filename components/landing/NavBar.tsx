'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Globe, Menu, X, Users } from 'lucide-react';
import { useState } from 'react';

export function NavBar({ locale }: { locale: string }) {
    const t = useTranslations('landing');
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 inset-x-0 z-50 glass-nav border-b border-outline-variant/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link
                        href={`/${locale}`}
                        className="shrink-0 flex items-center gap-2 cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-on-primary shadow-ambient bg-linear-to-br from-primary to-primary-container">
                            <Users size={20} />
                        </div>
                        <span className="text-2xl font-bold text-on-surface tracking-tight">
                            Bekkurinn
                        </span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="tap-target text-on-surface-variant hover:text-primary p-2 rounded-lg"
                            aria-label="Menu"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href={`/${locale}/samanburdur`} className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                            {t('nav.why_us')}
                        </Link>
                        <Link href={`/${locale}/bekkjarsattmali`} className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                            Bekkjarsáttmáli
                        </Link>
                        <Link href={`/${locale}/foreldrarolt`} className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                            Foreldrarölt
                        </Link>
                        <Link href={`/${locale}/handbok`} className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
                            Handbók
                        </Link>

                        {/* Language Switcher */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors">
                                <Globe size={20} />
                                <span className="uppercase text-xs font-bold">{t('nav.locale')}</span>
                            </button>
                            <div className="absolute top-full right-0 mt-2 w-36 rounded-xl shadow-ambient overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 bg-surface-container-lowest ghost-border">
                                <Link href="/is" className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high hover:text-primary">🇮🇸 Íslenska</Link>
                                <Link href="/en" className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high hover:text-primary">🇬🇧 English</Link>
                                <Link href="/pl" className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high hover:text-primary">🇵🇱 Polski</Link>
                                <Link href="/lt" className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high hover:text-primary">🇱🇹 Lietuvių</Link>
                            </div>
                        </div>

                        {user ? (
                            <Link
                                href={`/${locale}/dashboard`}
                                className="inline-flex items-center px-6 py-2.5 rounded-full font-semibold text-on-primary shadow-ambient transition-all hover:-translate-y-0.5 bg-linear-to-r from-primary to-primary-container"
                            >
                                Mælaborð
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={`/${locale}/login`}
                                    className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
                                >
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    href={`/${locale}/onboarding`}
                                    className="inline-flex items-center px-6 py-2.5 rounded-full font-semibold text-on-primary shadow-ambient transition-all hover:-translate-y-0.5 bg-linear-to-r from-primary to-primary-container"
                                >
                                    {t('hero.cta_primary')}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute w-full left-0 px-4 py-6 flex flex-col gap-4 h-screen overflow-y-auto pb-32 bg-surface-container-low border-t border-outline-variant/20">
                    <Link
                        href={`/${locale}/samanburdur`}
                        className="text-lg font-medium text-on-surface py-2 border-b border-outline-variant/20"
                        onClick={() => setIsOpen(false)}
                    >
                        {t('nav.why_us')}
                    </Link>
                    <Link
                        href={`/${locale}/bekkjarsattmali`}
                        className="text-lg font-medium text-on-surface py-2 border-b border-outline-variant/20"
                        onClick={() => setIsOpen(false)}
                    >
                        Bekkjarsáttmáli
                    </Link>
                    <Link
                        href={`/${locale}/foreldrarolt`}
                        className="text-lg font-medium text-on-surface py-2 border-b border-outline-variant/20"
                        onClick={() => setIsOpen(false)}
                    >
                        Foreldrarölt
                    </Link>
                    <Link
                        href={`/${locale}/handbok`}
                        className="text-lg font-medium text-on-surface py-2 border-b border-outline-variant/20"
                        onClick={() => setIsOpen(false)}
                    >
                        Handbók
                    </Link>
                    <Link
                        href={`/${locale}/#how-it-works`}
                        className="text-lg font-medium text-on-surface-variant py-2"
                        onClick={() => setIsOpen(false)}
                    >
                        {t('nav.how_it_works')}
                    </Link>
                    <Link
                        href={`/${locale}/#faq`}
                        className="text-lg font-medium text-on-surface-variant py-2"
                        onClick={() => setIsOpen(false)}
                    >
                        {t('nav.faq')}
                    </Link>

                    <div className="pt-4 flex flex-col gap-4">
                        {user ? (
                            <Link
                                href={`/${locale}/dashboard`}
                                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-on-primary shadow-ambient bg-linear-to-r from-primary to-primary-container"
                                onClick={() => setIsOpen(false)}
                            >
                                Mælaborð
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={`/${locale}/login`}
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-full font-medium text-on-surface bg-surface-container-high"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    href={`/${locale}/onboarding`}
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-on-primary shadow-ambient bg-linear-to-r from-primary to-primary-container"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {t('hero.cta_primary')}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
