import Link from 'next/link';
import { Calendar, Users, MessageSquare, Shield, CheckCircle, ArrowRight, Star, Sparkles, Clock, Heart } from 'lucide-react';

/**
 * Landing Page - Bekkurinn
 * 
 * Premium landing page designed to convert visitors.
 * Features hero, value props, social proof, and strong CTAs.
 */

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Simple Header */}
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
                            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Eiginleikar</a>
                            <a href="#how" className="text-gray-600 hover:text-gray-900 transition-colors">Hvernig virkar þetta?</a>
                            <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">Algengar spurningar</a>
                        </nav>
                        <Link
                            href="/is/login"
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Skrá inn
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
                            <span>Nýtt fyrir bekkjarfulltrúa og foreldra</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            Umsjón bekkjarins.
                            <br />
                            <span className="text-blue-600">Einfölduð</span>.
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                            Skipulagðu rölt, samskipti foreldra og dagsskrá bekkjarins — allt á einum stað.
                            <strong className="text-gray-900"> Nýtt kerfi sem gerir bekkjarformennsku auðveldari.</strong>
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <Link
                                href="/is/onboarding"
                                className="group inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                Byrja frítt
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a
                                href="#how"
                                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg border-2 border-gray-300 hover:border-gray-400 transition-all"
                            >
                                Sjá hvernig það virkar
                            </a>
                        </div>

                        {/* Honest Beta Badge instead of fake stats */}
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-200 rounded-xl mt-8">
                            <Sparkles size={20} className="text-blue-600" />
                            <span className="text-gray-700 font-medium">
                                Nýtt í beta — vertu meðal fyrstu notenda!
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
                            Allt sem þú þarft fyrir bekkinn
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Hönnuð sérstaklega fyrir íslenska grunnskóla með áherslu á einfaldleika og öryggi.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="group p-8 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Calendar className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Dagatal & Viðburðir</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Samstilltu sjálfkrafa við skóladagatal. Skipulagðu rölt, samkomur og ferðir
                                með smart áminningum.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-8 bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Users className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Foreldrasamtöl</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Örugg samskipti án Facebook. Sameiginleg skrá, tilkynningar og
                                persónuverndarstillingar.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-8 bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <MessageSquare className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Skipulagning Rólta</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Sjálfvirk skráning foreldra í rölt með sanngjörnu kerfi.
                                Enginn gleymdur, allir þáttakendur.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="group p-8 bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Shield className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Öryggi & Friðhelgi</h3>
                            <p className="text-gray-600 leading-relaxed">
                                GDPR samræmt. Aðeins bekkjarmeðlimir sjá gögn.
                                Engin auglýsing, engin gagnamöl.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="group p-8 bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Heart className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Ofnæmisvakt</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Skráðu ofnæmi og matarþarfir örugglega.
                                Allir sjá á einum stað — öruggari veislur.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="group p-8 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Clock className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Tímasparnaður</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Engar Facebook-umræður eða WhatsApp-hópar.
                                Allt á einum stað, skipulagt og clean.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Hvernig virkar þetta?
                        </h2>
                        <p className="text-xl text-gray-600">
                            Þrjú einföld skref til að byrja
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Step 1 */}
                        <div className="relative">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                                    1
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Stofna bekk</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Bekkjarfulltrúi býr til bekk með skóla og bekknúmeri.
                                    Færð strax boðskóða til að deila.
                                </p>
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
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Bjóða foreldrum</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Sendu boðskóða í WhatsApp eða í tölvupósti.
                                    Foreldrar skrá sig á 30 sekúndum.
                                </p>
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
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Skipuleggja saman</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Dagatal samstillt, rölt skipulögð, tilkynningar sendar.
                                Allt virkar bara!
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-16">
                        <Link
                            href="/is/onboarding"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            Byrja núna — það er frítt
                            <ArrowRight size={20} />
                        </Link>
                        <p className="text-sm text-gray-500 mt-4">Ekkert greiðslukort krafist · Tilbúið á 2 mínútum</p>
                    </div>
                </div>
            </section>

            {/* Why Join Beta Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Af hverju að vera meðal fyrstu?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Beta notendur fá sérstök fríðindi og móta framtíð kerfisins
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100">
                            <div className="flex gap-1 mb-4">
                                <CheckCircle size={24} className="text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Frítt að eilífu</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Beta notendur fá ávallt frítt aðgengi, jafnvel þó við bjóðum upp á premium features síðar.
                            </p>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100">
                            <div className="flex gap-1 mb-4">
                                <MessageSquare size={24} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Beinn áheyrn</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Þínar hugmyndir og þarfir móta hvernig kerfið þróast. Við hlustum á þig!
                            </p>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100">
                            <div className="flex gap-1 mb-4">
                                <Star size={24} className="text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Persónuleg þjónusta</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Forgangsaðstoð og persónuleg uppsetning. Við hjálpum þér að komast á flug.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-3xl mx-auto">                    <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Algengar spurningar
                    </h2>
                </div>

                    <div className="space-y-6">
                        <details className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg text-gray-900">
                                Er þetta frítt?
                                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="mt-4 text-gray-600 leading-relaxed">
                                Já! Bekkurinn er algjörlega frítt fyrir alla grunnskólabekki á Íslandi.
                                Við trúum á að öll börn eigi að hafa aðgang að góðri skipulagningu.
                            </p>
                        </details>

                        <details className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg text-gray-900">
                                Er þetta öruggt?
                                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="mt-4 text-gray-600 leading-relaxed">
                                Já! Við notum sama öryggi og bankar (256-bit encryption).
                                Öll gögn eru GDPR samræmd og geymd örugglega.
                                Aðeins bekkjarmeðlimir sjá upplýsingar.
                            </p>
                        </details>

                        <details className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg text-gray-900">
                                Hvernig byrja ég?
                                <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="mt-4 text-gray-600 leading-relaxed">
                                Smelltu á &quot;Byrja frítt&quot; og fylltu út upplýsingar um bekkinn þinn.
                                Færð strax boðskóða sem þú getur deilt með öðrum foreldrum.
                                Tekur um 2 mínútur!
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
                        Tilbúinn að prófa?
                    </h2>
                    <p className="text-xl sm:text-2xl text-white/90 mb-10 leading-relaxed">
                        Vertu meðal fyrstu til að prófa nýja leiðina í bekkjarskipulagi.
                    </p>
                    <Link
                        href="/is/onboarding"
                        className="inline-flex items-center gap-2 bg-white text-blue-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:scale-105"
                    >
                        Stofna bekk núna
                        <ArrowRight size={20} />
                    </Link>
                    <p className="text-white/80 mt-6 text-sm">
                        Frítt fyrir alla · Engin binding · Tilbúið á 2 mínútum
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center text-sm text-gray-400">
                        <p>© 2026 Bekkurinn. Allur réttur áskilinn. Gert með ❤️ á Íslandi.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
