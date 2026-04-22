'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Vote, Shield, CheckCircle2, FileText, ChevronRight, Lock } from 'lucide-react';
import { NavBar } from '@/components/landing/NavBar';
import { Footer } from '@/components/landing/Footer';

export default function BekkjarsattmaliLandingPage() {
    const t = useTranslations('landing_agreement');
    const locale = useLocale();

    return (
        <div className="min-h-screen bg-surface-container-lowest">
            <NavBar locale={locale} />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-rose-50 to-white -z-10" />
                    <div className="container mx-auto px-4 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container/70 text-on-secondary-container text-sm font-bold uppercase tracking-wide mb-6 animate-fade-in-up">
                            <Vote size={16} />
                            {t('hero.badge')}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-on-surface mb-6 tracking-tight max-w-4xl mx-auto leading-tight">
                            {t('hero.title')}
                        </h1>
                        <p className="text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto leading-relaxed">
                            {t('hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register?create=true"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all bg-secondary rounded-xl hover:bg-secondary/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                {t('hero.cta')}
                                <ChevronRight className="ml-2" size={20} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 bg-surface-container-lowest">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="p-8 rounded-2xl bg-surface border border-outline-variant/30 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-primary-container/20 rounded-xl flex items-center justify-center mb-6">
                                    <Lock className="text-primary" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-on-surface mb-3">{t('features.anonymous_title')}</h3>
                                <p className="text-on-surface-variant leading-relaxed">{t('features.anonymous_desc')}</p>
                            </div>

                            {/* Feature 2 */}
                            <div className="p-8 rounded-2xl bg-surface border border-outline-variant/30 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-primary-container/20 rounded-xl flex items-center justify-center mb-6">
                                    <FileText className="text-primary" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-on-surface mb-3">{t('features.templates_title')}</h3>
                                <p className="text-on-surface-variant leading-relaxed">{t('features.templates_desc')}</p>
                            </div>

                            {/* Feature 3 */}
                            <div className="p-8 rounded-2xl bg-surface border border-outline-variant/30 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mb-6">
                                    <CheckCircle2 className="text-on-secondary-container" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-on-surface mb-3">{t('features.result_title')}</h3>
                                <p className="text-on-surface-variant leading-relaxed">{t('features.result_desc')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Topics Section */}
                <section className="py-20 bg-on-surface text-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('topics.title')}</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-on-surface/90/50 border border-outline-variant">
                                    <Shield className="text-secondary/70 shrink-0" size={20} />
                                    <span className="font-medium">{t(`topics.t${i}`)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-surface-container-lowest">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <h2 className="text-3xl font-bold text-center mb-12">{t('faq.title')}</h2>
                        <div className="space-y-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="border-b border-outline-variant/30 pb-8 last:border-0">
                                    <h3 className="text-xl font-bold text-on-surface mb-2">{t(`faq.q${i}`)}</h3>
                                    <p className="text-on-surface-variant leading-relaxed">{t(`faq.a${i}`)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Bottom */}
                <section className="py-20 bg-secondary-container/40">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-on-surface mb-8 max-w-2xl mx-auto">
                            {t('hero.title')}
                        </h2>
                        <Link
                            href="/register?create=true"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all bg-on-surface rounded-xl hover:bg-on-surface/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {t('hero.cta')}
                            <ChevronRight className="ml-2" size={20} />
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
