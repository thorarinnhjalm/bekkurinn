'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Globe, ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function NavBar({ locale }: { locale: string }) {
    const t = useTranslations('landing');
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
                            B
                        </div>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">
                            Bekkurinn
                        </span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 hover:text-blue-600 p-2"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href={`/${locale}/samanburdur`} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                            {t('nav.why_us') || "Samanburður"}
                        </Link>

                        {/* Features Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                                {t('nav.features') || "Virkni"}
                                <ChevronDown size={16} />
                            </button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 z-50">
                                <Link href={`/${locale}/bekkjarsattmali`} className="block px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-50">
                                    Bekkjarsáttmáli
                                </Link>
                                <Link href={`/${locale}/foreldrarolt`} className="block px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                    Foreldrarölt
                                </Link>
                            </div>
                        </div>
                        <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">{t('nav.how_it_works')}</a>
                        <Link href={`/${locale}/handbok`} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                            Handbók
                        </Link>
                        <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">{t('nav.faq')}</a>

                        {/* Language Switcher */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                                <Globe size={20} />
                                <span className="uppercase text-xs font-bold">{t('nav.locale')}</span>
                            </button>
                            <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0">
                                <a href="/is" className="block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600">🇮🇸 Íslenska</a>
                                <a href="/en" className="block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600">🇬🇧 English</a>
                                <a href="/pl" className="block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600">🇵🇱 Polski</a>
                                <a href="/lt" className="block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600">🇱🇹 Lietuvių</a>
                            </div>
                        </div>

                        {user ? (
                            <Link
                                href={`/${locale}/dashboard`}
                                className="bg-blue-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-all shadow-sm hover:shadow-md"
                            >
                                Mælaborð
                            </Link>
                        ) : (
                            <Link
                                href={`/${locale}/login`}
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                            >
                                {t('nav.login')}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 px-4 py-6 shadow-lg flex flex-col gap-4 h-screen overflow-y-auto pb-32">
                    <Link
                        href={`/${locale}/samanburdur`}
                        className="text-lg font-medium text-gray-900 py-2 border-b border-gray-50"
                        onClick={() => setIsOpen(false)}
                    >
                        {t('nav.why_us') || "Samanburður"}
                    </Link>
                    <Link
                        href={`/${locale}/bekkjarsattmali`}
                        className="text-lg font-medium text-gray-900 py-2 border-b border-gray-50"
                        onClick={() => setIsOpen(false)}
                    >
                        Bekkjarsáttmáli
                    </Link>
                    <Link
                        href={`/${locale}/foreldrarolt`}
                        className="text-lg font-medium text-gray-900 py-2 border-b border-gray-50"
                        onClick={() => setIsOpen(false)}
                    >
                        Foreldrarölt
                    </Link>
                    <Link
                        href={`/${locale}/handbok`}
                        className="text-lg font-medium text-gray-900 py-2 border-b border-gray-50"
                        onClick={() => setIsOpen(false)}
                    >
                        Handbók
                    </Link>
                    <a
                        href="#how-it-works"
                        className="text-lg font-medium text-gray-600 py-2"
                        onClick={() => setIsOpen(false)}
                    >
                        {t('nav.how_it_works')}
                    </a>
                    <a
                        href="#faq"
                        className="text-lg font-medium text-gray-600 py-2"
                        onClick={() => setIsOpen(false)}
                    >
                        {t('nav.faq')}
                    </a>

                    <div className="pt-4 flex flex-col gap-4">
                        {user ? (
                            <Link
                                href={`/${locale}/dashboard`}
                                className="bg-blue-900 text-white px-6 py-3 rounded-xl font-medium text-center shadow-sm"
                                onClick={() => setIsOpen(false)}
                            >
                                Mælaborð
                            </Link>
                        ) : (
                            <Link
                                href={`/${locale}/login`}
                                className="bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-medium text-center"
                                onClick={() => setIsOpen(false)}
                            >
                                {t('nav.login')}
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
