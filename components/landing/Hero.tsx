'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

export function Hero({ locale }: { locale: string }) {
    const t = useTranslations('landing');
    const { user } = useAuth();

    // Rich text handling for bold words
    const richText = {
        strong: (chunks: React.ReactNode) => <span className="text-blue-600 font-bold">{chunks}</span>
    };

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white -z-10" />
            <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl -z-10 opacity-50 mix-blend-multiply filter" />
            <div className="absolute top-40 left-0 w-[600px] h-[600px] bg-amber-50/40 rounded-full blur-3xl -z-10 opacity-50 mix-blend-multiply filter" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        {t('hero.badge')}
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-8 leading-[1.05] text-center animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                    {t('hero.title_start')}{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 inline-block">
                        {t('hero.title_highlight')}
                    </span>
                </h1>

                <div className="flex justify-center w-full mb-16">
                    <p className="text-lg md:text-xl text-gray-500 max-w-xl leading-normal font-light text-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        {t.rich('hero.subtitle', richText)}
                    </p>
                </div>


                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href={user ? `/${locale}/dashboard` : `/${locale}/onboarding`}
                        className="w-full sm:w-auto px-10 py-4 bg-blue-900 text-white rounded-lg font-semibold text-lg hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                        {t('hero.cta_primary')} <ArrowRight size={20} />
                    </Link>
                    <Link
                        href="#features"
                        className="w-full sm:w-auto px-10 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        {t('hero.cta_secondary')}
                    </Link>
                </div>
            </div>
        </section>
    );
}
