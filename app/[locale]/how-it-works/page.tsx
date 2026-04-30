import { ArrowLeft, UserPlus, Key, Users, Bell, Calendar, MapPin, Gift, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hvernig virkar Bekkurinn? | Bekkurinn',
    description: 'Lærðu hvernig Bekkurinn hjálpar foreldrum að halda utan um bekkjarsamfélagið. Einfalt í notkun - engar Excel-skrár, engir Facebook-hópar.',
    openGraph: {
        title: 'Hvernig virkar Bekkurinn?',
        description: 'Einfalt kerfi fyrir foreldra til að halda utan um bekkjarsamfélagið.',
        type: 'website',
    },
};

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function HowItWorksPage({ params }: PageProps) {
    const { locale } = await params;

    const steps = [
        {
            number: 1,
            title: 'Skráðu þig inn',
            description: 'Notaðu Google eða búðu til aðgang með netfangi. Það tekur aðeins nokkrar sekúndur.',
            icon: UserPlus,
            color: 'blue',
        },
        {
            number: 2,
            title: 'Fáðu bekkjarkóða',
            description: 'Bekkjarfulltrúi sendir þér 6 stafa kóða fyrir bekkinn þinn. Enginn getur skoðað bekkjarlistann án kóða.',
            icon: Key,
            color: 'purple',
        },
        {
            number: 3,
            title: 'Skráðu fjölskylduna',
            description: 'Bættu við barni og tengiliðaupplýsingum. Aðrir foreldrar sjá bara það sem þú vilt deila.',
            icon: Users,
            color: 'green',
        },
        {
            number: 4,
            title: 'Búið!',
            description: 'Nú hefur þú aðgang að bekkjarlistanum, afmælum, viðburðum og fleiru. Allt á einum stað.',
            icon: Bell,
            color: 'orange',
        },
    ];

    const features = [
        {
            title: 'Bekkjarlisti',
            description: 'Sjáðu alla foreldra og nemendur í bekknum með tengiliðaupplýsingum.',
            icon: Users,
        },
        {
            title: 'Afmælisdagatal',
            description: 'Aldrei gleyma afmæli aftur. Fáðu áminningar fyrir afmælisdaga barnanna.',
            icon: Gift,
        },
        {
            title: 'Viðburðir',
            description: 'Skipuleggðu bekkjarviðburði, afmælispartý og aðra samkomur.',
            icon: Calendar,
        },
        {
            title: 'Óskilamunir',
            description: 'Tilkynna og finna týnda hluti sem skilja eftir sig í skólanum.',
            icon: MapPin,
        },
        {
            title: 'Handbók',
            description: 'Leiðbeiningar fyrir bekkjarfulltrúa og foreldra um hlutverk og verkefni.',
            icon: BookOpen,
        },
    ];

    return (
        <div className="min-h-screen bg-surface">
            {/* Header */}
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 text-white py-16 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Link
                        href={`/${locale}/login`}
                        className="inline-flex items-center gap-2 text-primary-container/40 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Til baka
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-bold">
                        Hvernig virkar Bekkurinn?
                    </h1>
                    <p className="text-xl text-primary-container/30 max-w-2xl">
                        Einfalt kerfi fyrir foreldra til að halda utan um bekkjarsamfélagið.
                        Engar Excel-skrár, engir Facebook-hópar.
                    </p>
                </div>
            </div>

            {/* Steps Section */}
            <div className="max-w-4xl mx-auto px-4 py-16">
                <h2 className="text-2xl font-bold text-on-surface text-center mb-12">
                    Komast af stað í fjórum einföldum skrefum
                </h2>

                <div className="space-y-8">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isLast = index === steps.length - 1;

                        const colorClasses = {
                            blue: 'bg-primary-container/20 text-primary border-primary/30',
                            purple: 'bg-secondary-container text-on-secondary-container border-secondary/30',
                            green: 'bg-primary-container/20 text-primary border-primary/30',
                            orange: 'bg-tertiary-fixed/60 text-on-tertiary-fixed border-tertiary/30',
                        };

                        return (
                            <div key={step.number} className="flex gap-6">
                                {/* Step Number & Line */}
                                <div className="flex flex-col items-center">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${colorClasses[step.color as keyof typeof colorClasses]}`}>
                                        <Icon size={24} />
                                    </div>
                                    {!isLast && (
                                        <div className="w-0.5 h-full bg-surface-container-high mt-2" />
                                    )}
                                </div>

                                {/* Step Content */}
                                <div className="flex-1 pb-8">
                                    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-bold text-on-surface-variant uppercase">
                                                Skref {step.number}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-on-surface mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-on-surface-variant">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-surface-container-lowest py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-on-surface text-center mb-4">
                        Hvað er innifalið?
                    </h2>
                    <p className="text-on-surface-variant text-center mb-12 max-w-2xl mx-auto">
                        Bekkurinn er hannað til að einfalda samskipti foreldra og halda utan um allt sem skiptir máli.
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={feature.title}
                                    className="bg-surface rounded-2xl p-6 border border-outline-variant/30 hover:border-primary/30 transition-colors"
                                >
                                    <div className="w-12 h-12 bg-primary-container/20 rounded-xl flex items-center justify-center mb-4">
                                        <Icon className="text-primary" size={24} />
                                    </div>
                                    <h3 className="font-bold text-on-surface mb-2">{feature.title}</h3>
                                    <p className="text-sm text-on-surface-variant">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto px-4 py-16">
                <h2 className="text-2xl font-bold text-on-surface text-center mb-12">
                    Algengar spurningar
                </h2>

                <div className="space-y-4">
                    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30">
                        <h3 className="font-bold text-on-surface mb-2">Er þetta ókeypis?</h3>
                        <p className="text-on-surface-variant">
                            Já, Bekkurinn er ókeypis fyrir foreldra og bekkjarfulltrúa. Við erum að prófa kerfið og viljum fá endurgjöf.
                        </p>
                    </div>

                    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30">
                        <h3 className="font-bold text-on-surface mb-2">Hvernig fæ ég bekkjarkóða?</h3>
                        <p className="text-on-surface-variant">
                            Bekkjarfulltrúi stofnar bekkinn og fær einstakan kóða sem hægt er að deila með öðrum foreldrum. Ef enginn bekkjarfulltrúi er í bekknum getur þú sjálf/ur stofnað hann.
                        </p>
                    </div>

                    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30">
                        <h3 className="font-bold text-on-surface mb-2">Hversu örugg eru gögnin mín?</h3>
                        <p className="text-on-surface-variant">
                            Við notum Firebase sem er öruggur vettvangur frá Google. Allar tengingar eru dulkóðaðar og aðeins staðfestir foreldrar hafa aðgang að bekkjarupplýsingum.
                        </p>
                    </div>

                    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30">
                        <h3 className="font-bold text-on-surface mb-2">Get ég verið í fleiri en einum bekk?</h3>
                        <p className="text-on-surface-variant">
                            Já, ef þú átt fleiri en eitt barn í mismunandi bekkjum getur þú bætt þeim öllum við og skipt á milli þeirra í appinu.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 text-white py-16 px-4">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl font-bold">
                        Tilbúin/n að byrja?
                    </h2>
                    <p className="text-primary-container/30 text-lg">
                        Skráðu þig inn og vertu með í að einfalda samskipti foreldra.
                    </p>
                    <Link
                        href={`/${locale}/login`}
                        className="inline-flex items-center gap-2 bg-surface-container-lowest text-primary px-8 py-4 rounded-xl font-bold hover:bg-primary-container/15 transition-colors"
                    >
                        Skrá inn
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="py-8 px-4 text-center text-sm text-on-surface-variant">
                <p>
                    Ertu með spurningu?{' '}
                    <Link href={`/${locale}/contact`} className="text-primary hover:underline">
                        Hafðu samband
                    </Link>
                </p>
            </div>
        </div>
    );
}
