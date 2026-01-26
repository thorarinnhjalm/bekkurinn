'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export function Footer() {
    const t = useTranslations('landing');
    const locale = useLocale();

    return (
        <footer className="bg-white border-t border-gray-100 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                <div>
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white font-bold shadow-md">B</div>
                        <span className="font-bold text-xl text-gray-900">Bekkurinn</span>
                    </div>
                    <p className="text-gray-500 text-sm max-w-xs">{t('footer.desc') || 'Öruggt og einfalt skipulag fyrir grunnskóla.'}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 text-sm text-gray-600 font-medium">
                    <Link href={`/${locale}/privacy`} className="hover:text-blue-600 transition-colors">Persónuvernd</Link>
                    <Link href={`/${locale}/contact`} className="hover:text-blue-600 transition-colors">Aðstoð</Link>
                </div>

                <div className="text-gray-400 text-sm text-right">
                    <p>© {new Date().getFullYear()} Bekkurinn.</p>
                    <p className="mt-2 text-xs text-gray-300">
                        Útgefið af Neðri Hóll Hugmyndahús ehf.<br />
                        Kt: 470126-2480 • VSK: 159950<br />
                        Álfhólsvegi 97, 200 Kópavogur
                    </p>
                </div>
            </div>
        </footer>
    );
}
