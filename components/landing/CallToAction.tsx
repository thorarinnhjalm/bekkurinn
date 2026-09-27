'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CallToAction({ locale }: { locale: string }) {
    const t = useTranslations('landing');

    return (
        <section className="py-24 relative overflow-hidden bg-surface-container-low">
            {/* Ambient radial glow */}
            <div
                className="absolute inset-0 -z-10"
                aria-hidden="true"
                style={{
                    background:
                        'radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in oklab, var(--primary-container) 20%, transparent), transparent 70%)',
                }}
            />

            <div className="max-w-4xl mx-auto px-4 text-center relative z-10 flex flex-col items-center w-full">
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-on-surface">
                    {t('cta_final.title')}
                </h2>
                <p className="text-xl md:text-2xl text-on-surface-variant mb-10 max-w-2xl mx-auto leading-relaxed">
                    {t('cta_final.subtitle')}
                </p>
                <div className="flex flex-col items-center gap-6 w-full">
                    <Link
                        href={`/${locale}/onboarding`}
                        className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full font-bold text-lg text-on-primary shadow-ambient transition-all hover:-translate-y-0.5 bg-linear-to-r from-primary to-primary-container"
                    >
                        {t('cta_final.button')}
                        <ArrowRight size={20} />
                    </Link>
                    <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest">
                        {t('cta_final.fine_print')}
                    </p>
                </div>
            </div>
        </section>
    );
}
