'use client';

import { useTranslations } from 'next-intl';

export function FAQ() {
    const t = useTranslations('landing');

    return (
        <section id="faq" className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">{t('faq.title')}</h2>
                <div className="space-y-6">
                    <FaqItem q={t('faq.q1')} a={t('faq.a1')} />
                    <FaqItem q={t('faq.q2')} a={t('faq.a2')} />
                    <FaqItem q={t('faq.q3')} a={t('faq.a3')} />
                    <FaqItem q={t('faq.q4')} a={t('faq.a4')} />
                    <FaqItem q={t('faq.q5')} a={t('faq.a5')} />
                </div>
            </div>
        </section>
    );
}

function FaqItem({ q, a }: any) {
    return (
        <div className="bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100 flex flex-col items-center text-center cursor-default">
            <h3 className="font-bold text-gray-900 mb-3 flex flex-col items-center gap-3">
                <span className="text-blue-900 text-lg bg-blue-100/50 w-10 h-10 rounded-xl flex items-center justify-center border border-blue-200 shadow-sm">?</span>
                <span className="text-lg">{q}</span>
            </h3>
            <p className="text-gray-600 leading-relaxed text-base max-w-2xl">{a}</p>
        </div>
    );
}
