'use client';

import { useTranslations } from 'next-intl';
import { Calendar, Shield, Users, Lock, CheckCircle2, Coffee, Vote, Scale } from 'lucide-react';
import React from 'react';

export function Features() {
    const t = useTranslations('landing');

    return (
        <section id="features" className="py-24 relative bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto mb-16">
                    <h2 className="text-sm text-on-surface-variant font-bold tracking-widest uppercase mb-3">
                        {t('features.title')}
                    </h2>
                    <p className="text-3xl md:text-4xl font-bold text-on-surface leading-tight">
                        {t('features.subtitle')}
                    </p>
                </div>

                {/* Bento grid - mixed sizes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(220px,auto)]">
                    {/* Hero feature — Bekkjarsáttmáli (lg: 2x2) */}
                    <FeatureCard
                        className="md:col-span-2 lg:col-span-2 lg:row-span-2"
                        tone="primary"
                        icon={<Vote size={28} />}
                        title={t('features.f7_title')}
                        desc={t('features.f7_desc')}
                        large
                    />

                    <FeatureCard
                        icon={<Calendar size={22} />}
                        title={t('features.f1_title')}
                        desc={t('features.f1_desc')}
                    />
                    <FeatureCard
                        icon={<Shield size={22} />}
                        title={t('features.f2_title')}
                        desc={t('features.f2_desc')}
                    />

                    <FeatureCard
                        icon={<Users size={22} />}
                        title={t('features.f3_title')}
                        desc={t('features.f3_desc')}
                    />
                    <FeatureCard
                        icon={<Scale size={22} />}
                        title={t('features.f8_title')}
                        desc={t('features.f8_desc')}
                    />

                    {/* Wide feature — Minni tími í stjórnun */}
                    <FeatureCard
                        className="md:col-span-2 lg:col-span-2"
                        tone="tertiary"
                        icon={<Coffee size={22} />}
                        title={t('features.f6_title')}
                        desc={t('features.f6_desc')}
                    />

                    <FeatureCard
                        icon={<Lock size={22} />}
                        title={t('features.f4_title')}
                        desc={t('features.f4_desc')}
                    />
                    <FeatureCard
                        icon={<CheckCircle2 size={22} />}
                        title={t('features.f5_title')}
                        desc={t('features.f5_desc')}
                    />
                </div>
            </div>
        </section>
    );
}

type Tone = 'default' | 'primary' | 'tertiary';

function FeatureCard({
    icon,
    title,
    desc,
    className = '',
    tone = 'default',
    large = false,
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
    className?: string;
    tone?: Tone;
    large?: boolean;
}) {
    const toneClasses: Record<Tone, string> = {
        default: 'bg-surface-container-lowest text-on-surface',
        primary: 'bg-gradient-to-br from-primary to-primary-container text-on-primary',
        tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed',
    };

    const iconBgClasses: Record<Tone, string> = {
        default: 'bg-surface-container-high text-primary',
        primary: 'bg-on-primary/15 text-on-primary',
        tertiary: 'bg-on-tertiary-fixed/10 text-on-tertiary-fixed',
    };

    const descClasses: Record<Tone, string> = {
        default: 'text-on-surface-variant',
        primary: 'text-on-primary/85',
        tertiary: 'text-on-tertiary-fixed/85',
    };

    return (
        <div
            className={`rounded-3xl p-8 shadow-ambient transition-all duration-300 flex flex-col ${toneClasses[tone]} ${className}`}
        >
            <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${iconBgClasses[tone]}`}
            >
                {icon}
            </div>
            <h3
                className={`font-bold leading-tight mb-3 ${large ? 'text-2xl md:text-3xl' : 'text-lg'}`}
            >
                {title}
            </h3>
            <p
                className={`leading-relaxed ${large ? 'text-base md:text-lg' : 'text-[15px]'} ${descClasses[tone]}`}
            >
                {desc}
            </p>
        </div>
    );
}
