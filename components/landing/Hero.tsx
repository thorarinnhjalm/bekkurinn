'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

export function Hero({ locale }: { locale: string }) {
    const t = useTranslations('landing');
    const { user } = useAuth();

    const richText = {
        strong: (chunks: React.ReactNode) => (
            <span className="font-semibold text-on-surface">{chunks}</span>
        ),
    };

    return (
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden">
            {/* Ambient radial background - fjord teal + warm amber haze */}
            <div
                className="absolute inset-0 -z-10"
                aria-hidden="true"
                style={{
                    background:
                        'radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in oklab, var(--primary-container) 25%, transparent), transparent 60%), radial-gradient(ellipse 60% 50% at 85% 30%, color-mix(in oklab, var(--tertiary-fixed) 40%, transparent), transparent 60%), var(--surface)',
                }}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                {/* Status chip - tertiary-fixed amber with pulse dot */}
                <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-sm font-medium mb-8 shadow-ambient">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                        </span>
                        {t('hero.beta_badge')}
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.05] text-center text-on-surface">
                    {t('hero.title_start')}{' '}
                    <span className="bg-linear-to-r from-primary to-primary-container bg-clip-text text-transparent">
                        {t('hero.title_highlight')}
                    </span>
                </h1>

                <div className="flex justify-center w-full mb-12">
                    <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed font-normal text-center">
                        {t.rich('hero.subtitle', richText)}
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <Link
                        href={user ? `/${locale}/dashboard` : `/${locale}/onboarding`}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg text-on-primary shadow-ambient transition-all hover:-translate-y-0.5 active:translate-y-0 bg-linear-to-r from-primary to-primary-container"
                    >
                        {t('hero.cta_primary')} <ArrowRight size={20} />
                    </Link>
                    <Link
                        href="#how-it-works"
                        className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline"
                    >
                        {t('hero.cta_secondary')}
                    </Link>
                </div>
            </div>
        </section>
    );
}
