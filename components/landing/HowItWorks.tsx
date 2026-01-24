'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';

export function HowItWorks({ locale }: { locale: string }) {
    const t = useTranslations('landing');
    const { user } = useAuth();

    return (
        <section id="how-it-works" className="py-24 bg-gray-50 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('how.title')}</h2>
                    <p className="text-xl text-gray-600">{t('how.subtitle')}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent -z-0 border-t border-dashed border-gray-300/50" />

                    <StepCard number="1" title={t('how.step1_title')} desc={t('how.step1_desc')} />
                    <StepCard number="2" title={t('how.step2_title')} desc={t('how.step2_desc')} />
                    <StepCard number="3" title={t('how.step3_title')} desc={t('how.step3_desc')} />
                </div>

                <div className="mt-16 text-center">
                    <Link
                        href={user ? `/${locale}/dashboard` : `/${locale}/onboarding`}
                        className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm cursor-pointer"
                    >
                        {t('how.cta')}
                    </Link>
                    <p className="mt-4 text-sm text-gray-500">{t('how.fine_print')}</p>
                </div>
            </div>
        </section>
    );
}

function StepCard({ number, title, desc }: any) {
    return (
        <div className="text-center relative z-10 p-4 md:p-0 flex flex-col items-center">
            <div className="w-14 h-14 bg-white border-2 border-blue-900 text-blue-900 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto mb-6 shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
                {number}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{title}</h3>
            <p className="text-gray-600 leading-relaxed max-w-xs mx-auto text-center">{desc}</p>
        </div>
    );
}
