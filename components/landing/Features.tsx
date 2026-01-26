'use client';

import { useTranslations } from 'next-intl';
import { Calendar, Shield, Users, Lock, CheckCircle2, Coffee, Vote, Scale } from 'lucide-react';
import React from 'react';

export function Features() {
    const t = useTranslations('landing');

    return (
        <section id="features" className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-sm text-gray-500 font-bold tracking-widest uppercase mb-3">{t('features.title')}</h2>
                    <p className="text-3xl md:text-4xl font-bold text-gray-900">{t('features.subtitle')}</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Calendar className="text-gray-900" size={24} />}
                        title={t('features.f1_title')}
                        desc={t('features.f1_desc')}
                    />
                    <FeatureCard
                        icon={<Shield className="text-gray-900" size={24} />}
                        title={t('features.f2_title')}
                        desc={t('features.f2_desc')}
                    />
                    <FeatureCard
                        icon={<Users className="text-gray-900" size={24} />}
                        title={t('features.f3_title')}
                        desc={t('features.f3_desc')}
                    />
                    <FeatureCard
                        icon={<Scale className="text-gray-900" size={24} />}
                        title={t('features.f8_title')}
                        desc={t('features.f8_desc')}
                    />
                    <FeatureCard
                        icon={<Lock className="text-gray-900" size={24} />}
                        title={t('features.f4_title')}
                        desc={t('features.f4_desc')}
                    />
                    <FeatureCard
                        icon={<CheckCircle2 className="text-gray-900" size={24} />}
                        title={t('features.f5_title')}
                        desc={t('features.f5_desc')}
                    />
                    <FeatureCard
                        icon={<Coffee className="text-gray-900" size={24} />}
                        title={t('features.f6_title')}
                        desc={t('features.f6_desc')}
                    />

                    {/* Full Width Feature - The "Sell" */}
                    <div className="md:col-span-2 lg:col-span-3 mt-8">
                        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100 flex flex-col md:flex-row items-center gap-8 md:gap-16 text-center md:text-left transition-all hover:border-gray-200">
                            <div className="shrink-0 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <Vote className="text-gray-900 w-16 h-16" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('features.f7_title')}</h3>
                                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">{t('features.f7_desc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ icon, title, desc, className = '' }: { icon: React.ReactNode, title: string, desc: string, className?: string }) {
    return (
        <div className={`p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300 flex flex-col items-start ${className}`}>
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">{title}</h3>
            <p className="text-gray-500 leading-relaxed text-[15px]">{desc}</p>
        </div>
    );
}
