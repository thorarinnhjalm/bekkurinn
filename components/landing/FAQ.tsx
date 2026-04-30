'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Minus } from 'lucide-react';

export function FAQ() {
    const t = useTranslations('landing');

    return (
        <section id="faq" className="py-24 bg-surface">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-5xl font-bold text-on-surface text-center mb-16 tracking-tight">
                    {t('faq.title')}
                </h2>
                <div className="space-y-4">
                    <FaqItem q={t('faq.q1')} a={t('faq.a1')} />
                    <FaqItem q={t('faq.q2')} a={t('faq.a2')} />
                    <FaqItem q={t('faq.q3')} a={t('faq.a3')} />
                    <FaqItem q={t('faq.q4')} a={t('faq.a4')} />
                    <FaqItem q={t('faq.q5')} a={t('faq.a5')} />
                    <FaqItem q={t('faq.q6')} a={t('faq.a6')} />
                    <FaqItem q={t('faq.q7')} a={t('faq.a7')} />
                    <FaqItem q={t('faq.q8')} a={t('faq.a8')} />
                </div>
            </div>
        </section>
    );
}

function FaqItem({ q, a }: { q: string; a: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={`rounded-2xl transition-all duration-300 ${
                isOpen
                    ? 'bg-surface-container-low shadow-ambient'
                    : 'bg-surface-container-lowest hover:bg-surface-container-low'
            }`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left"
                aria-expanded={isOpen}
            >
                <span
                    className={`text-lg font-bold pr-8 transition-colors ${
                        isOpen ? 'text-primary' : 'text-on-surface'
                    }`}
                >
                    {q}
                </span>
                <span
                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isOpen
                            ? 'bg-primary-container/20 text-primary'
                            : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                >
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </span>
            </button>
            <div
                className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
            >
                <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-on-surface-variant leading-relaxed">{a}</p>
                </div>
            </div>
        </div>
    );
}
