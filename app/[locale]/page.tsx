'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { ArrowRight, Shield, Calendar, Users, Home, Coffee, MessageCircle, Lock, CheckCircle2, Globe } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function HomePage() {
    const t = useTranslations('landing');
    const { user } = useAuth();
    const router = useRouter();

    const richText = {
        strong: (chunks: React.ReactNode) => <span className="text-blue-600 font-bold">{chunks}</span>
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Fixed Navigation Bar with Glass Effect */}
            <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/10">
                                B
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
                                Bekkurinn
                            </span>
                        </div>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <NavLink href="#features">{t('nav.features')}</NavLink>
                            <NavLink href="#how-it-works">{t('nav.how_it_works')}</NavLink>
                            <NavLink href="#faq">{t('nav.faq')}</NavLink>

                            {/* Language Switcher */}
                            <div className="relative group">
                                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                                    <Globe size={20} />
                                    <span className="uppercase text-xs font-bold">{t('nav.locale')}</span>
                                </button>
                                <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0">
                                    <a href="/is" className="block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600">🇮🇸 Íslenska</a>
                                    <a href="/en" className="block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600">🇬🇧 English</a>
                                    <a href="/pl" className="block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600">🇵🇱 Polski</a>
                                    <a href="/lt" className="block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600">🇱🇹 Lietuvių</a>
                                </div>
                            </div>

                            {user ? (
                                <Link
                                    href="/is/dashboard"
                                    className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                    Mælaborð
                                </Link>
                            ) : (
                                <Link
                                    href="/is/login"
                                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                                >
                                    {t('nav.login')}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section with Soft Gradient Background */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white -z-10" />
                <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl -z-10 opacity-50 mix-blend-multiply filter" />
                <div className="absolute top-40 left-0 w-[600px] h-[600px] bg-amber-50/40 rounded-full blur-3xl -z-10 opacity-50 mix-blend-multiply filter" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        {t('hero.badge')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-8 leading-[1.05] text-center animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                        {t('hero.title_start')}{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 inline-block">
                            {t('hero.title_highlight')}
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-500 mb-16 max-w-3xl mx-auto leading-relaxed font-light text-center text-balance animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        {t.rich('hero.subtitle', richText)}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
                        <Link
                            href={user ? "/is/dashboard" : "/is/onboarding"}
                            className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 flex items-center justify-center gap-2"
                        >
                            {t('hero.cta_primary')} <ArrowRight size={20} />
                        </Link>
                        <Link
                            href="#features"
                            className="w-full sm:w-auto px-10 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            {t('hero.cta_secondary')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid with Modern Cards */}
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

            {/* How It Works - Clean Steps */}
            <section id="how-it-works" className="py-24 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('how.title')}</h2>
                        <p className="text-xl text-gray-600">{t('how.subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-0" />

                        <StepCard number="1" title={t('how.step1_title')} desc={t('how.step1_desc')} />
                        <StepCard number="2" title={t('how.step2_title')} desc={t('how.step2_desc')} />
                        <StepCard number="3" title={t('how.step3_title')} desc={t('how.step3_desc')} />
                    </div>

                    <div className="mt-16 text-center">
                        <Link
                            href={user ? "/is/dashboard" : "/is/onboarding"}
                            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                            {t('how.cta')}
                        </Link>
                        <p className="mt-4 text-sm text-gray-500">{t('how.fine_print')}</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
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

            {/* Final CTA - High Impact */}
            <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('cta_final.title')}</h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">{t('cta_final.subtitle')}</p>
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href="/is/onboarding"
                            className="px-10 py-5 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
                        >
                            {t('cta_final.button')}
                        </Link>
                        <p className="text-sm text-gray-500">{t('cta_final.fine_print')}</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 font-bold">B</div>
                        <span className="font-bold text-lg text-gray-900">Bekkurinn</span>
                    </div>
                    <p className="mb-4">{t('footer.copyright')}</p>
                </div>
            </footer>
        </div>
    );
}

// --- Components for Visual Consistency ---

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a href={href} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            {children}
        </a>
    );
}

function FeatureCard({ icon, title, desc, color }: any) {
    return (
        <div className="p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 group cursor-default text-center flex flex-col items-center">
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{title}</h3>
            <p className="text-gray-500 leading-relaxed text-[15px]">{desc}</p>
        </div>
    );
}

function StepCard({ number, title, desc }: any) {
    return (
        <div className="text-center relative z-10 bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-xl">
            <div className="w-12 h-12 bg-white border-2 border-blue-600 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6 shadow-sm">
                {number}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">{desc}</p>
        </div>
    );
}

function FaqItem({ q, a }: any) {
    return (
        <div className="bg-gray-50 rounded-xl p-6 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
            <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-3">
                <span className="text-blue-600 shrink-0">?</span> {q}
            </h3>
            <p className="text-gray-600 pl-6 leading-relaxed text-sm">{a}</p>
        </div>
    );
}
