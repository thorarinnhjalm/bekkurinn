import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Calendar, Users, MessageSquare, Shield, CheckCircle, ArrowRight, Star, Sparkles, Clock, Heart } from 'lucide-react';

/**
 * Landing Page - Bekkurinn
 * 
 * Standardized landing page using i18n translations.
 * Supports multicultural society by allowing language switching.
 */

export default function HomePage() {
    const t = useTranslations('landing');

    // Rich text renderer helper for bold tags
    const richText = {
        strong: (chunks: React.ReactNode) => <strong className="text-gray-900">{chunks}</strong>
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">B</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">Bekkurinn</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">{t('nav.features')}</a>
                            <a href="#how" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">{t('nav.how_it_works')}</a>
                            <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">{t('nav.faq')}</a>
                        </nav>
                        <Link
                            href="/is/login"
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            {t('nav.login')}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                            <Sparkles size={16} />
                            <span>{t('hero.badge')}</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            {t('hero.title_start')}
                            <br />
                            <span className="text-blue-600">{t('hero.title_highlight')}</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                            {t.rich('hero.subtitle', richText)}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Link
                                href="/is/onboarding"
                                className="group inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                {t('hero.cta_primary')}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a
                                href="#how"
                                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg border-2 border-gray-300 hover:border-gray-400 transition-all"
                            >
                                {t('hero.cta_secondary')}
                            </a>
                        </div>

                        {/* Beta Badge */}
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-200 rounded-xl mt-8 shadow-sm">
                            <Sparkles size={20} className="text-blue-600" />
                            <span className="text-gray-700 font-medium">
                                {t('hero.beta_badge')}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            {t('features.title')}
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {t('features.subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="group p-8 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Calendar className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('features.f1_title')}</h3>
                            <p className="text-gray-600 leading-relaxed">{t('features.f1_desc')}</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-8 bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Users className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('features.f2_title')}</h3>
                            <p className="text-gray-600 leading-relaxed">{t('features.f2_desc')}</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-8 bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <MessageSquare className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('features.f3_title')}</h3>
                            <p className="text-gray-600 leading-relaxed">{t('features.f3_desc')}</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="group p-8 bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Shield className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('features.f4_title')}</h3>
                            <p className="text-gray-600 leading-relaxed">{t('features.f4_desc')}</p>
                        </div>

                        {/* Feature 5 */}
                        <div className="group p-8 bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Heart className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('features.f5_title')}</h3>
                            <p className="text-gray-600 leading-relaxed">{t('features.f5_desc')}</p>
                        </div>

                        {/* Feature 6 */}
                        <div className="group p-8 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Clock className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('features.f6_title')}</h3>
                            <p className="text-gray-600 leading-relaxed">{t('features.f6_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            {t('how.title')}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {t('how.subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Step 1 */}
                        <div className="relative">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                                    1
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('how.step1_title')}</h3>
                                <p className="text-gray-600 leading-relaxed">{t('how.step1_desc')}</p>
                            </div>
                            <div className="hidden md:block absolute top-8 -right-6 text-blue-300">
                                <ArrowRight size={32} />
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                                    2
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('how.step2_title')}</h3>
                                <p className="text-gray-600 leading-relaxed">{t('how.step2_desc')}</p>
                            </div>
                            <div className="hidden md:block absolute top-8 -right-6 text-blue-300">
                                <ArrowRight size={32} />
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                                3
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('how.step3_title')}</h3>
                            <p className="text-gray-600 leading-relaxed">{t('how.step3_desc')}</p>
                        </div>
                    </div>

                    <div className="text-center mt-16">
                        <Link
                            href="/is/onboarding"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            {t('how.cta')}
                            <ArrowRight size={20} />
                        </Link>
                        <p className="text-sm text-gray-500 mt-4">{t('how.fine_print')}</p>
                    </div>
                </div>
            </section>

            {/* Why Join Beta */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            {t('beta.title')}
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {t('beta.subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Benefit 1 */}
                        <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100">
                            <div className="flex gap-1 mb-4">
                                <CheckCircle size={24} className="text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('beta.b1_title')}</h3>
                            <p className="text-gray-600 leading-relaxed">{t('beta.b1_desc')}</p>
                        </div>

                        {/* Benefit 2 */}
                        <div className="p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100">
                            <div className="flex gap-1 mb-4">
                                <MessageSquare size={24} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('beta.b2_title')}</h3>
                            <p className="text-gray-600 leading-relaxed">{t('beta.b2_desc')}</p>
                        </div>

                        {/* Benefit 3 */}
                        <div className="p-8 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100">
                            <div className="flex gap-1 mb-4">
                                <Star size={24} className="text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('beta.b3_title')}</h3>
                            <p className="text-gray-600 leading-relaxed">{t('beta.b3_desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            {t('faq.title')}
                        </h2>
                    </div>

                    <div className="space-y-6">
                        <details className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg text-gray-900">
                                {t('faq.q1')}
                                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="mt-4 text-gray-600 leading-relaxed">{t('faq.a1')}</p>
                        </details>

                        <details className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg text-gray-900">
                                {t('faq.q2')}
                                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="mt-4 text-gray-600 leading-relaxed">{t('faq.a2')}</p>
                        </details>

                        <details className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg text-gray-900">
                                {t('faq.q3')}
                                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="mt-4 text-gray-600 leading-relaxed">{t('faq.a3')}</p>
                        </details>

                        <details className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg text-gray-900">
                                {t('faq.q4')}
                                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="mt-4 text-gray-600 leading-relaxed">{t('faq.a4')}</p>
                        </details>

                        <details className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg text-gray-900">
                                {t('faq.q5')}
                                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="mt-4 text-gray-600 leading-relaxed">{t('faq.a5')}</p>
                        </details>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
                        {t('cta_final.title')}
                    </h2>
                    <p className="text-xl sm:text-2xl text-white/90 mb-10 leading-relaxed">
                        {t('cta_final.subtitle')}
                    </p>
                    <Link
                        href="/is/onboarding"
                        className="inline-flex items-center gap-2 bg-white text-blue-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:scale-105"
                    >
                        {t('cta_final.button')}
                        <ArrowRight size={20} />
                    </Link>
                    <p className="text-white/80 mt-6 text-sm">
                        {t('cta_final.fine_print')}
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">B</span>
                                </div>
                                <span className="text-xl font-bold text-white">Bekkurinn</span>
                            </div>
                            <p className="text-sm text-gray-400">
                                {t('footer.desc')}
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-white mb-4">{t('footer.products')}</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#features" className="hover:text-white transition-colors">{t('nav.features')}</a></li>
                                <li><a href="#how" className="hover:text-white transition-colors">{t('nav.how_it_works')}</a></li>
                                <li><a href="#faq" className="hover:text-white transition-colors">{t('nav.faq')}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-white mb-4">{t('footer.support')}</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="mailto:hjalp@bekkurinn.is" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">{t('footer.forgot_password')}</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-white mb-4">{t('footer.legal')}</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
                        <p>{t('footer.copyright')}</p>
                        <p className="text-xs text-gray-600 mt-2">{t('footer.ai_disclaimer')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
