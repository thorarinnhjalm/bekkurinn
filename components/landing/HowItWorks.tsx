'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { PlusCircle, UserPlus, CheckCircle2 } from 'lucide-react';
import React from 'react';

export function HowItWorks({ locale }: { locale: string }) {
    const t = useTranslations('landing');
    const { user } = useAuth();

    return (
        <section id="how-it-works" className="py-24 bg-surface-container-low">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold text-on-surface mb-4 tracking-tight">
                        {t('how.title')}
                    </h2>
                    <p className="text-xl text-on-surface-variant">{t('how.subtitle')}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connecting dashed line - desktop only */}
                    <div
                        className="hidden md:block absolute top-10 left-[16%] right-[16%] border-t-2 border-dashed border-outline-variant/40 -z-0"
                        aria-hidden="true"
                    />

                    <StepCard
                        icon={<PlusCircle size={32} />}
                        title={t('how.step1_title')}
                        desc={t('how.step1_desc')}
                    />
                    <StepCard
                        icon={<UserPlus size={32} />}
                        title={t('how.step2_title')}
                        desc={t('how.step2_desc')}
                    />
                    <StepCard
                        icon={<CheckCircle2 size={32} />}
                        title={t('how.step3_title')}
                        desc={t('how.step3_desc')}
                    />
                </div>

                <div className="mt-16 text-center">
                    <Link
                        href={user ? `/${locale}/dashboard` : `/${locale}/onboarding`}
                        className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold text-on-primary shadow-ambient transition-all hover:-translate-y-0.5 bg-gradient-to-r from-primary to-primary-container"
                    >
                        {t('how.cta')}
                    </Link>
                    <p className="mt-4 text-sm text-on-surface-variant">
                        {t('how.fine_print')}
                    </p>
                </div>
            </div>
        </section>
    );
}

function StepCard({
    icon,
    title,
    desc,
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
}) {
    return (
        <div className="text-center relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-ambient bg-surface-container-lowest text-primary ring-4 ring-surface-container-low">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">{title}</h3>
            <p className="text-on-surface-variant leading-relaxed max-w-xs mx-auto">
                {desc}
            </p>
        </div>
    );
}
