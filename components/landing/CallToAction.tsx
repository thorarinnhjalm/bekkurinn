'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function CallToAction({ locale }: { locale: string }) {
    const t = useTranslations('landing');

    return (
        <section className="py-24 bg-white relative overflow-hidden border-t border-gray-100">
            <div className="max-w-4xl mx-auto px-4 text-center relative z-10 flex flex-col items-center w-full">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900">{t('cta_final.title')}</h2>
                <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto font-normal leading-relaxed">{t('cta_final.subtitle')}</p>
                <div className="flex flex-col items-center gap-6 w-full">
                    <Link
                        href={`/${locale}/onboarding`}
                        className="px-10 py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2 w-full md:w-auto justify-center"
                    >
                        {t('cta_final.button')}
                        <ArrowRight size={20} />
                    </Link>
                    <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">{t('cta_final.fine_print')}</p>
                </div>
            </div>
        </section>
    );

}
