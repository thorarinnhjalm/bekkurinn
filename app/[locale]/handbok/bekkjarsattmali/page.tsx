'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Vote, CheckCircle2, Shield, Users, Calendar } from 'lucide-react';

export default function BekkjarsattmaliPage() {
    const t = useTranslations('handbook.agreement');

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-700 text-sm font-bold uppercase tracking-wide mb-4">
                        <Vote size={16} />
                        {t('badge')}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t('title')}</h1>
                    <p className="text-xl text-gray-600 leading-relaxed">{t('subtitle')}</p>
                </div>

                {/* What is it */}
                <section className="mb-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Users className="text-blue-600" size={20} />
                        </div>
                        {t('what.title')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">{t('what.p1')}</p>
                    <p className="text-gray-700 leading-relaxed">{t('what.p2')}</p>
                </section>

                {/* Topics Covered */}
                <section className="mb-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="text-green-600" size={20} />
                        </div>
                        {t('topics.title')}
                    </h2>
                    <div className="space-y-4">
                        <TopicItem title={t('topics.birthdays.title')} desc={t('topics.birthdays.desc')} />
                        <TopicItem title={t('topics.invitations.title')} desc={t('topics.invitations.desc')} />
                        <TopicItem title={t('topics.social.title')} desc={t('topics.social.desc')} />
                        <TopicItem title={t('topics.gaming.title')} desc={t('topics.gaming.desc')} />
                        <TopicItem title={t('topics.screen.title')} desc={t('topics.screen.desc')} />
                    </div>
                </section>

                {/* How it works */}
                <section className="mb-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Calendar className="text-purple-600" size={20} />
                        </div>
                        {t('how.title')}
                    </h2>
                    <ol className="space-y-4">
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">1</span>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">{t('how.step1.title')}</h3>
                                <p className="text-gray-600 text-sm">{t('how.step1.desc')}</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">2</span>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">{t('how.step2.title')}</h3>
                                <p className="text-gray-600 text-sm">{t('how.step2.desc')}</p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">3</span>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">{t('how.step3.title')}</h3>
                                <p className="text-gray-600 text-sm">{t('how.step3.desc')}</p>
                            </div>
                        </li>
                    </ol>
                </section>

                {/* Privacy */}
                <section className="mb-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Shield className="text-amber-600" size={20} />
                        </div>
                        {t('privacy.title')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">{t('privacy.desc')}</p>
                </section>

                {/* CTA */}
                <div className="text-center">
                    <Link
                        href="/agreement"
                        className="inline-block px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-600 text-sm">{desc}</p>
        </div>
    );
}
