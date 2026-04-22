'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowRight, Check, X, Shield, Users, Globe, Lock, Calendar, Search, Scale } from 'lucide-react';
import { NavBar } from '@/components/landing/NavBar';
import Link from 'next/link';

export default function WhyUsPage() {
    const router = useRouter();
    const params = useParams();
    const locale = (params.locale as string) || 'is';

    return (
        <div className="min-h-screen bg-surface font-sans selection:bg-primary-container/20 selection:text-primary">
            {/* Header */}
            <NavBar locale={locale} />

            <main className="pt-32 pb-20">
                {/* Hero */}
                <section className="max-w-4xl mx-auto px-6 text-center mb-24">
                    <h1 className="text-4xl md:text-5xl font-bold text-on-surface mb-6 tracking-tight">
                        Af hverju að velja sérhæft kerfi?
                    </h1>
                    <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                        Samanburður á Bekknum og algengum samskiptamiðlum eins og Facebook og WhatsApp.
                    </p>
                </section>

                {/* Factual Comparison */}
                <section className="max-w-5xl mx-auto px-4 mb-24">
                    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
                        <div className="grid grid-cols-12 border-b border-outline-variant/30 bg-surface/50">
                            <div className="col-span-4 p-6 font-semibold text-on-surface">Eiginleiki</div>
                            <div className="col-span-4 p-6 font-semibold text-on-surface-variant text-center border-l border-outline-variant/30">Samfélagsmiðlar</div>
                            <div className="col-span-4 p-6 font-bold text-primary text-center border-l border-outline-variant/30 bg-primary-container/15/30">Bekkurinn</div>
                        </div>

                        {/* Row 1: Privacy */}
                        <div className="grid grid-cols-12 border-b border-outline-variant/30 items-center">
                            <div className="col-span-4 p-6">
                                <h3 className="font-semibold text-on-surface">Persónuvernd</h3>
                                <p className="text-sm text-on-surface-variant mt-1">Hver hefur aðgang að gögnunum?</p>
                            </div>
                            <div className="col-span-4 p-6 text-center border-l border-outline-variant/30 text-on-surface-variant">
                                <p>Í eigu tæknirisa. Notað í auglýsingar.</p>
                            </div>
                            <div className="col-span-4 p-6 text-center border-l border-outline-variant/30 bg-primary-container/15/10 dark-blue-text font-medium">
                                <div className="flex flex-col items-center gap-2">
                                    <Shield size={20} className="text-primary" />
                                    <span>Lokað kerfi. Engin sala gagna.</span>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Structure */}
                        <div className="grid grid-cols-12 border-b border-outline-variant/30 items-center">
                            <div className="col-span-4 p-6">
                                <h3 className="font-semibold text-on-surface">Upplýsingar</h3>
                                <p className="text-sm text-on-surface-variant mt-1">Aðgengi að mikilvægum upplýsingum</p>
                            </div>
                            <div className="col-span-4 p-6 text-center border-l border-outline-variant/30 text-on-surface-variant">
                                <p>Týnast í "straumnum" (feed). Erfitt að leita.</p>
                            </div>
                            <div className="col-span-4 p-6 text-center border-l border-outline-variant/30 bg-primary-container/15/10 dark-blue-text font-medium">
                                <div className="flex flex-col items-center gap-2">
                                    <Search size={20} className="text-primary" />
                                    <span>Allt flokkað: Skráin, Viðburðir, Verkefni.</span>
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Events */}
                        <div className="grid grid-cols-12 items-center">
                            <div className="col-span-4 p-6">
                                <h3 className="font-semibold text-on-surface">Viðburðir & Skráning</h3>
                                <p className="text-sm text-on-surface-variant mt-1">Að halda utan um mætingu og verkefni</p>
                            </div>
                            <div className="col-span-4 p-6 text-center border-l border-outline-variant/30 text-on-surface-variant">
                                <p>Óformleg "Polls" eða athugasemdir.</p>
                            </div>
                            <div className="col-span-4 p-6 text-center border-l border-outline-variant/30 bg-primary-container/15/10 dark-blue-text font-medium">
                                <div className="flex flex-col items-center gap-2">
                                    <Calendar size={20} className="text-primary" />
                                    <span>Sérsniðið skráningarkerfi.</span>
                                </div>
                            </div>
                        </div>

                        {/* Row 4: Fairness */}
                        <div className="grid grid-cols-12 items-center border-t border-outline-variant/30">
                            <div className="col-span-4 p-6">
                                <h3 className="font-semibold text-on-surface">Jafnræði</h3>
                                <p className="text-sm text-on-surface-variant mt-1">Hvernig dreifist álagið á foreldra?</p>
                            </div>
                            <div className="col-span-4 p-6 text-center border-l border-outline-variant/30 text-on-surface-variant">
                                <p>Erfitt að fylgjast með. Oft sömu aðilarnir sem gera allt.</p>
                            </div>
                            <div className="col-span-4 p-6 text-center border-l border-outline-variant/30 bg-primary-container/15/10 dark-blue-text font-medium">
                                <div className="flex flex-col items-center gap-2">
                                    <Scale size={20} className="text-primary" />
                                    <span>Skráir mætingu á hvert barn. Tryggir sanngirni.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* For Parent Associations (Clean Style) */}
                <section className="max-w-5xl mx-auto px-6 mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-on-surface mb-4">Fyrir Foreldrafélög</h2>
                        <p className="text-on-surface-variant max-w-2xl mx-auto">
                            Kerfið styður við skólasamfélagið í heild sinni, ekki bara einstaka bekki.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary-container/15 rounded-lg flex items-center justify-center text-primary mb-4">
                                <Globe size={24} />
                            </div>
                            <h3 className="font-bold text-on-surface mb-2">Fjölmenning</h3>
                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                Viðmótið styður íslensku, ensku, pólsku og fleiri tungumál. Allir foreldrar geta tekið þátt á sínum forsendum.
                            </p>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary-container/15 rounded-lg flex items-center justify-center text-primary mb-4">
                                <Users size={24} />
                            </div>
                            <h3 className="font-bold text-on-surface mb-2">Beinn Aðgangur</h3>
                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                Stjórnendur (foreldraráð) hafa yfirsýn og geta náð til foreldra án milliliða eða reiknireglna (algorithms).
                            </p>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-secondary-container/60 rounded-lg flex items-center justify-center text-on-secondary-container mb-4">
                                <Lock size={24} />
                            </div>
                            <h3 className="font-bold text-on-surface mb-2">Öryggi</h3>
                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                Lokað umhverfi þar sem aðeins boðnir aðilar (foreldrar í viðkomandi bekk) hafa aðgang.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Simple Questions */}
                <section className="max-w-2xl mx-auto px-6 mb-24 text-center">
                    <h2 className="text-2xl font-bold text-on-surface mb-8">Algengar spurningar</h2>

                    <div className="space-y-8 text-left">
                        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30">
                            <h3 className="font-bold text-on-surface mb-2">Hvað kostar að nota kerfið?</h3>
                            <p className="text-on-surface-variant">
                                Grunnkerfið er <strong>ókeypis</strong> í beta-útgáfu. Við munum kynna áskriftarleiðir síðar fyrir ítarlegri virkni, en grunnvirkni fyrir bekkjarfulltrúa verður alltaf aðgengileg.
                            </p>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30">
                            <h3 className="font-bold text-on-surface mb-2">Hvernig stofna ég bekk?</h3>
                            <p className="text-on-surface-variant">
                                Þú skráir þig inn, velur skóla og árgang. Kerfið býr til boðskóða sem þú deilir með öðrum foreldrum.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="text-center py-12 bg-primary text-white rounded-none md:rounded-3xl max-w-5xl mx-auto md:mb-12">
                    <h2 className="text-3xl font-bold mb-4 text-white">Prófaðu kerfið í dag</h2>
                    <p className="opacity-80 mb-8 max-w-xl mx-auto text-white">Enginn kostnaður, engin skuldbinding. Einfaldaðu utanumhaldið.</p>
                    <Link
                        href={`/${locale}/onboarding`}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-surface-container-lowest text-on-surface rounded-full font-bold hover:bg-surface-container transition-colors"
                    >
                        Stofna Bekk
                        <ArrowRight size={20} />
                    </Link>
                </section>

                <footer className="text-center text-on-surface-variant text-sm pb-8">
                    © 2026 Bekkurinn
                </footer>
            </main>
        </div>
    );
}
