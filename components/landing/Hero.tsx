'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

export function Hero({ locale }: { locale: string }) {
    const t = useTranslations('landing');
    const { user } = useAuth();

    // Rich text handling - clean bold
    const richText = {
        strong: (chunks: React.ReactNode) => (
            <span className="font-semibold text-gray-900">{chunks}</span>
        )
    };

    return (
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden bg-white">
            {/* Subtle background - very clean */}
            <div className="absolute top-0 inset-0 h-full w-full bg-[#fafafa] -z-20" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-medium mb-8 shadow-sm">
                        {t('hero.badge')}
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-8 leading-[1.1] text-center">
                    {t('hero.title_start')}{' '}
                    <span className="text-gray-900">
                        {t('hero.title_highlight')}
                    </span>
                </h1>

                <div className="flex justify-center w-full mb-12">
                    <p className="text-xl text-gray-500 max-w-2xl leading-relaxed font-normal text-center">
                        {t.rich('hero.subtitle', richText)}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href={user ? `/${locale}/dashboard` : `/${locale}/onboarding`}
                        className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all shadow-sm hover:translate-y-[-1px] flex items-center justify-center gap-2"
                    >
                        {t('hero.cta_primary')} <ArrowRight size={20} />
                    </Link>
                    <Link
                        href="#how-it-works"
                        className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all"
                    >
                        {t('hero.cta_secondary')}
                    </Link>
                </div>
            </div>
        </section>
    );
}
