'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

export function Hero({ locale }: { locale: string }) {
    const t = useTranslations('landing');
    const { user } = useAuth();

    // Rich text handling for highlight
    const richText = {
        strong: (chunks: React.ReactNode) => (
            <span className="relative inline-block px-2">
                <span className="absolute inset-0 bg-yellow-200/60 -rotate-1 rounded-lg -z-10" />
                <span className="relative font-bold text-stone-900">{chunks}</span>
            </span>
        )
    };

    return (
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden bg-[#FDFBF7]">
            {/* Background Decor - Warmer tones */}
            <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-amber-100/30 rounded-full blur-3xl -z-10" />
            <div className="absolute top-40 left-0 w-[600px] h-[600px] bg-stone-200/30 rounded-full blur-3xl -z-10" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-sm font-medium mb-8">
                        {t('hero.badge')}
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-stone-900 tracking-tight mb-8 leading-[1.1] text-center">
                    {t('hero.title_start')}{' '}
                    <span className="relative inline-block whitespace-nowrap px-2">
                        <span className="absolute inset-0 bg-yellow-300 w-full h-full -rotate-2 rounded-lg -z-10 opacity-60"></span>
                        <span className="relative text-stone-900">{t('hero.title_highlight')}</span>
                    </span>
                </h1>

                <div className="flex justify-center w-full mb-12">
                    <p className="text-xl text-stone-600 max-w-2xl leading-relaxed font-normal text-center">
                        {t.rich('hero.subtitle', richText)}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href={user ? `/${locale}/dashboard` : `/${locale}/onboarding`}
                        className="w-full sm:w-auto px-8 py-4 bg-stone-900 text-[#FDFBF7] rounded-xl font-semibold text-lg hover:bg-stone-800 transition-all shadow-sm hover:translate-y-[-2px] flex items-center justify-center gap-2"
                    >
                        {t('hero.cta_primary')} <ArrowRight size={20} />
                    </Link>
                    <Link
                        href="#features"
                        className="w-full sm:w-auto px-8 py-4 bg-white text-stone-700 border-2 border-stone-200 rounded-xl font-semibold text-lg hover:bg-stone-50 hover:border-stone-300 transition-all"
                    >
                        {t('hero.cta_secondary')}
                    </Link>
                </div>
            </div>
        </section>
    );
}
