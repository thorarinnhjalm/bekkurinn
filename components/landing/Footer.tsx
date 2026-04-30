'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Users } from 'lucide-react';

export function Footer() {
    const t = useTranslations('landing');
    const locale = useLocale();

    return (
        <footer className="bg-surface-container py-16 border-t border-outline-variant/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-on-primary shadow-ambient bg-linear-to-br from-primary to-primary-container">
                                <Users size={20} />
                            </div>
                            <span className="font-bold text-xl text-on-surface">Bekkurinn</span>
                        </div>
                        <p className="text-on-surface-variant text-sm max-w-xs leading-relaxed">
                            {t('footer.desc')}
                        </p>
                    </div>

                    {/* Products */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                            {t('footer.products')}
                        </h3>
                        <ul className="space-y-3 text-sm text-on-surface-variant">
                            <li>
                                <Link
                                    href={`/${locale}/bekkjarsattmali`}
                                    className="hover:text-primary transition-colors"
                                >
                                    Bekkjarsáttmáli
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/foreldrarolt`}
                                    className="hover:text-primary transition-colors"
                                >
                                    Foreldrarölt
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/samanburdur`}
                                    className="hover:text-primary transition-colors"
                                >
                                    {t('nav.why_us')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                            {t('footer.support')}
                        </h3>
                        <ul className="space-y-3 text-sm text-on-surface-variant">
                            <li>
                                <Link
                                    href={`/${locale}/handbok`}
                                    className="hover:text-primary transition-colors"
                                >
                                    Handbók
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/contact`}
                                    className="hover:text-primary transition-colors"
                                >
                                    {t('footer.contact')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/login`}
                                    className="hover:text-primary transition-colors"
                                >
                                    {t('footer.forgot_password')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                            {t('footer.legal')}
                        </h3>
                        <ul className="space-y-3 text-sm text-on-surface-variant">
                            <li>
                                <Link
                                    href={`/${locale}/terms`}
                                    className="hover:text-primary transition-colors"
                                >
                                    {t('footer.terms')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/privacy`}
                                    className="hover:text-primary transition-colors"
                                >
                                    {t('footer.privacy')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-on-surface-variant">
                    <p>© {new Date().getFullYear()} Bekkurinn.</p>
                    <p className="text-xs text-on-surface-variant/80 text-center md:text-right">
                        Útgefið af Neðri Hóll Hugmyndahús ehf. • Kt: 470126-2480 • VSK: 159950
                        • Álfhólsvegi 97, 200 Kópavogur
                    </p>
                </div>
            </div>
        </footer>
    );
}
