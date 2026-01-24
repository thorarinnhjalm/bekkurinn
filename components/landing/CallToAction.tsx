'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function CallToAction({ locale }: { locale: string }) {
    const t = useTranslations('landing');

    return (
        <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>

            <div className="max-w-4xl mx-auto px-4 text-center relative z-10 flex flex-col items-center w-full">
                <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight text-white">{t('cta_final.title')}</h2>
                <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">{t('cta_final.subtitle')}</p>
                <div className="flex flex-col items-center gap-6 w-full">
                    <Link
                        href={`/${locale}/onboarding`}
                        className="px-12 py-5 bg-white text-blue-900 rounded-xl font-bold text-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3 w-full md:w-auto justify-center"
                    >
                        {t('cta_final.button')}
                        <ArrowRight size={24} />
                    </Link>
                    <p className="text-sm text-gray-500 font-mono uppercase tracking-widest">{t('cta_final.fine_print')}</p>
                </div>
            </div>
        </section>
    );
}
