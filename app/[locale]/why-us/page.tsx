'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, Check, X, Shield, Users, Globe, Lock, Calendar, Search } from 'lucide-react';
import Link from 'next/link';

export default function WhyUsPage() {
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'is';

    return (
        <div className="min-h-screen bg-stone-50 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Header */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 fixed w-full top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-xl text-nordic-blue hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white">B</div>
                        <span>Bekkurinn</span>
                    </Link>
                    <Link href={`/${locale}/login`} className="px-5 py-2 bg-nordic-blue text-white rounded-full font-medium hover:bg-nordic-blue-dark transition-colors text-sm">
                        Skrá sig inn
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20">
                {/* Hero */}
                <section className="max-w-4xl mx-auto px-6 text-center mb-24">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                        Af hverju að velja sérhæft kerfi?
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Samanburður á Bekknum og algengum samskiptamiðlum eins og Facebook og WhatsApp.
                    </p>
                </section>

                {/* Factual Comparison */}
                <section className="max-w-5xl mx-auto px-4 mb-24">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-12 border-b border-gray-200 bg-gray-50/50">
                            <div className="col-span-4 p-6 font-semibold text-gray-900">Eiginleiki</div>
                            <div className="col-span-4 p-6 font-semibold text-gray-500 text-center border-l border-gray-200">Samfélagsmiðlar</div>
                            <div className="col-span-4 p-6 font-bold text-nordic-blue text-center border-l border-gray-200 bg-blue-50/30">Bekkurinn</div>
                        </div>

                        {/* Row 1: Privacy */}
                        <div className="grid grid-cols-12 border-b border-gray-100 items-center">
                            <div className="col-span-4 p-6">
                                <h3 className="font-semibold text-gray-900">Persónuvernd</h3>
                                <p className="text-sm text-gray-500 mt-1">Hver hefur aðgang að gögnunum?</p>
                            </div>
                            <div className="col-span-4 p-6 text-center border-l border-gray-100 text-gray-600">
                                <p>Í eigu tæknirisa. Notað í auglýsingar.</p>
                            </div>
                            <div className="col-span-4 p-6 text-center border-l border-gray-100 bg-blue-50/10 dark-blue-text font-medium">
                                <div className="flex flex-col items-center gap-2">
                                    <Shield size={20} className="text-nordic-blue" />
                                    <span>Lokað kerfi. Engin sala gagna.</span>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Structure */}
                        <div className="grid grid-cols-12 border-b border-gray-100 items-center">
                            <div className="col-span-4 p-6">
                                <h3 className="font-semibold text-gray-900">Upplýsingar</h3>
                                <p className="text-sm text-gray-500 mt-1">Aðgengi að mikilvægum upplýsingum</p>
                            </div>
                            <div className="col-span-4 p-6 text-center border-l border-gray-100 text-gray-600">
                                <p>Týnast í "straumnum" (feed). Erfitt að leita.</p>
                            </div>
                            <div className="col-span-4 p-6 text-center border-l border-gray-100 bg-blue-50/10 dark-blue-text font-medium">
                                <div className="flex flex-col items-center gap-2">
                                    <Search size={20} className="text-nordic-blue" />
                                    <span>Allt flokkað: Skráin, Viðburðir, Verkefni.</span>
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Events */}
                        <div className="grid grid-cols-12 items-center">
                            <div className="col-span-4 p-6">
                                <h3 className="font-semibold text-gray-900">Viðburðir & Skráning</h3>
                                <p className="text-sm text-gray-500 mt-1">Að halda utan um mætingu og verkefni</p>
                            </div>
                            <div className="col-span-4 p-6 text-center border-l border-gray-100 text-gray-600">
                                <p>Óformleg "Polls" eða athugasemdir.</p>
                            </div>
                            <div className="col-span-4 p-6 text-center border-l border-gray-100 bg-blue-50/10 dark-blue-text font-medium">
                                <div className="flex flex-col items-center gap-2">
                                    <Calendar size={20} className="text-nordic-blue" />
                                    <span>Sérsniðið skráningarkerfi.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* For Parent Associations (Clean Style) */}
                <section className="max-w-5xl mx-auto px-6 mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Fyrir Foreldrafélög</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Kerfið styður við skólasamfélagið í heild sinni, ekki bara einstaka bekki.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-nordic-blue mb-4">
                                <Globe size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Fjölmenning</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Viðmótið styður íslensku, ensku, pólsku og fleiri tungumál. Allir foreldrar geta tekið þátt á sínum forsendum.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-700 mb-4">
                                <Users size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Beinn Aðgangur</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Stjórnendur (foreldraráð) hafa yfirsýn og geta náð til foreldra án milliliða eða reiknireglna (algorithms).
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-700 mb-4">
                                <Lock size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Öryggi</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Lokað umhverfi þar sem aðeins boðnir aðilar (foreldrar í viðkomandi bekk) hafa aðgang.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Simple Questions */}
                <section className="max-w-2xl mx-auto px-6 mb-24 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Algengar spurningar</h2>

                    <div className="space-y-8 text-left">
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-2">Hvað kostar að nota kerfið?</h3>
                            <p className="text-gray-600">
                                Grunnkerfið er <strong>ókeypis</strong> í beta-útgáfu. Við munum kynna áskriftarleiðir síðar fyrir ítarlegri virkni, en grunnvirkni fyrir bekkjarfulltrúa verður alltaf aðgengileg.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-2">Hvernig stofna ég bekk?</h3>
                            <p className="text-gray-600">
                                Þú skráir þig inn, velur skóla og árgang. Kerfið býr til boðskóða sem þú deilir með öðrum foreldrum.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="text-center py-12 bg-gray-900 text-white rounded-none md:rounded-3xl max-w-5xl mx-auto md:mb-12">
                    <h2 className="text-3xl font-bold mb-4">Prófaðu kerfið í dag</h2>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto">Enginn kostnaður, engin skuldbinding. Einfaldaðu utanumhaldið.</p>
                    <Link
                        href={`/${locale}/onboarding`}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-colors"
                    >
                        Stofna Bekk
                        <ArrowRight size={20} />
                    </Link>
                </section>

                <footer className="text-center text-gray-500 text-sm pb-8">
                    © 2026 Bekkurinn
                </footer>
            </main>
        </div>
    );
}
