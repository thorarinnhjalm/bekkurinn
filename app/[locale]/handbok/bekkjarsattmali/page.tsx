'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Vote, CheckCircle2, Shield, Users, Calendar } from 'lucide-react';

export default function BekkjarsattmaliPage() {
    const t = useTranslations('handbook.agreement');

    return (
        <div className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container text-sm font-bold uppercase tracking-wide mb-4">
                        <Vote size={16} />
                        {t('badge')}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-4 tracking-tight">{t('title')}</h1>
                    <p className="text-xl text-on-surface-variant leading-relaxed">{t('subtitle')}</p>
                </div>

                {/* What is it */}
                <section className="mb-8 bg-surface-container-lowest rounded-3xl p-8 shadow-ambient">
                    <h2 className="text-2xl font-bold text-on-surface mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-container/15 rounded-xl flex items-center justify-center">
                            <Users className="text-primary" size={20} />
                        </div>
                        {t('what.title')}
                    </h2>
                    <p className="text-on-surface-variant leading-relaxed mb-4">{t('what.p1')}</p>
                    <p className="text-on-surface-variant leading-relaxed">{t('what.p2')}</p>
                </section>

                {/* Topics Covered */}
                <section className="mb-8 bg-surface-container-lowest rounded-3xl p-8 shadow-ambient">
                    <h2 className="text-2xl font-bold text-on-surface mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-container/15 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="text-primary" size={20} />
                        </div>
                        {t('topics.title')}
                    </h2>
                    <div className="space-y-3">
                        <TopicItem title={t('topics.birthdays.title')} desc={t('topics.birthdays.desc')} />
                        <TopicItem title={t('topics.invitations.title')} desc={t('topics.invitations.desc')} />
                        <TopicItem title={t('topics.social.title')} desc={t('topics.social.desc')} />
                        <TopicItem title={t('topics.gaming.title')} desc={t('topics.gaming.desc')} />
                        <TopicItem title={t('topics.screen.title')} desc={t('topics.screen.desc')} />
                    </div>
                </section>

                {/* How it works */}
                <section className="mb-8 bg-surface-container-lowest rounded-3xl p-8 shadow-ambient">
                    <h2 className="text-2xl font-bold text-on-surface mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary-container rounded-xl flex items-center justify-center">
                            <Calendar className="text-on-secondary-container" size={20} />
                        </div>
                        {t('how.title')}
                    </h2>
                    <ol className="space-y-4">
                        <Step n={1} title={t('how.step1.title')} desc={t('how.step1.desc')} />
                        <Step n={2} title={t('how.step2.title')} desc={t('how.step2.desc')} />
                        <Step n={3} title={t('how.step3.title')} desc={t('how.step3.desc')} />
                    </ol>
                </section>

                {/* Privacy */}
                <section className="mb-12 bg-tertiary-fixed/50 rounded-3xl p-8">
                    <h2 className="text-2xl font-bold text-on-tertiary-fixed mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-tertiary-fixed rounded-xl flex items-center justify-center">
                            <Shield className="text-on-tertiary-fixed" size={20} />
                        </div>
                        {t('privacy.title')}
                    </h2>
                    <p className="text-on-tertiary-fixed leading-relaxed">{t('privacy.desc')}</p>
                </section>

                {/* CTA */}
                <div className="text-center">
                    <Link
                        href="/agreement"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-on-primary shadow-ambient bg-linear-to-r from-primary to-primary-container hover:-translate-y-0.5 transition-all"
                    >
                        {t('cta')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

function TopicItem({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="p-4 bg-surface-container-low rounded-2xl ghost-border">
            <h3 className="font-bold text-on-surface mb-1">{title}</h3>
            <p className="text-on-surface-variant text-sm">{desc}</p>
        </div>
    );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
    return (
        <li className="flex gap-4">
            <span className="shrink-0 w-8 h-8 bg-primary-container/15 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                {n}
            </span>
            <div>
                <h3 className="font-bold text-on-surface mb-1">{title}</h3>
                <p className="text-on-surface-variant text-sm">{desc}</p>
            </div>
        </li>
    );
}
