'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Footprints, Bell, CalendarCheck, ClipboardList, ChevronRight, Users } from 'lucide-react';
import { NavBar } from '@/components/landing/NavBar';
import { Footer } from '@/components/landing/Footer';

export default function ForeldraroltLandingPage() {
    const t = useTranslations('landing_patrol');
    const locale = useLocale();

    return (
        <div className="min-h-screen bg-white">
            <NavBar locale={locale} />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white -z-10" />
                    <div className="container mx-auto px-4 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold uppercase tracking-wide mb-6 animate-fade-in-up">
                            <Footprints size={16} />
                            {t('hero.badge')}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight max-w-4xl mx-auto leading-tight">
                            {t('hero.title')}
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            {t('hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register?create=true"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                {t('hero.cta')}
                                <ChevronRight className="ml-2" size={20} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-6">
                                    <CalendarCheck className="text-rose-600" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('features.schedule_title')}</h3>
                                <p className="text-gray-600 leading-relaxed">{t('features.schedule_desc')}</p>
                            </div>

                            {/* Feature 2 */}
                            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                                    <Bell className="text-amber-600" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('features.reminders_title')}</h3>
                                <p className="text-gray-600 leading-relaxed">{t('features.reminders_desc')}</p>
                            </div>

                            {/* Feature 3 */}
                            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                                    <ClipboardList className="text-emerald-600" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('features.report_title')}</h3>
                                <p className="text-gray-600 leading-relaxed">{t('features.report_desc')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it works Section */}
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('steps.title')}</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="text-center relative">
                                    <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center text-xl font-bold text-blue-600 shadow-sm border border-gray-100 mb-6">
                                        {i}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{t(`steps.s${i}_title`)}</h3>
                                    <p className="text-gray-600 leading-relaxed">{t(`steps.s${i}_desc`)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <h2 className="text-3xl font-bold text-center mb-12">{t('faq.title')}</h2>
                        <div className="space-y-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="border-b border-gray-100 pb-8 last:border-0">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t(`faq.q${i}`)}</h3>
                                    <p className="text-gray-600 leading-relaxed">{t(`faq.a${i}`)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Bottom */}
                <section className="py-20 bg-blue-50">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 max-w-2xl mx-auto">
                            {t('hero.title')}
                        </h2>
                        <Link
                            href="/register?create=true"
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all bg-gray-900 rounded-xl hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
