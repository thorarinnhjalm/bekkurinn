'use client';

import { useTranslations } from 'next-intl';
import { Calendar, Shield, Users, Lock, CheckCircle2, Coffee } from 'lucide-react';

export function Features() {
    const t = useTranslations('landing');

    return (
        <section id="features" className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase mb-2">{t('features.title')}</h2>
                    <p className="text-3xl md:text-4xl font-bold text-gray-900">{t('features.subtitle')}</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Calendar className="text-blue-600" size={28} />}
                        title={t('features.f1_title')}
                        desc={t('features.f1_desc')}
                        color="bg-blue-50"
                    />
                    <FeatureCard
                        icon={<Shield className="text-green-600" size={28} />}
                        title={t('features.f2_title')}
                        desc={t('features.f2_desc')}
                        color="bg-green-50"
                    />
                    <FeatureCard
                        icon={<Users className="text-purple-600" size={28} />}
                        title={t('features.f3_title')}
                        desc={t('features.f3_desc')}
                        color="bg-purple-50"
                    />
                    <FeatureCard
                        icon={<Lock className="text-amber-600" size={28} />}
                        title={t('features.f4_title')}
                        desc={t('features.f4_desc')}
                        color="bg-amber-50"
                    />
                    <FeatureCard
                        icon={<CheckCircle2 className="text-teal-600" size={28} />}
                        title={t('features.f5_title')}
                        desc={t('features.f5_desc')}
                        color="bg-teal-50"
                    />
                    <FeatureCard
                        icon={<Coffee className="text-indigo-600" size={28} />}
                        title={t('features.f6_title')}
                        desc={t('features.f6_desc')}
                        color="bg-indigo-50"
                    />
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ icon, title, desc, color }: any) {
    return (
        <div className="p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center group">
            <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{title}</h3>
            <p className="text-gray-500 leading-relaxed text-[15px]">{desc}</p>
        </div>
    );
}
