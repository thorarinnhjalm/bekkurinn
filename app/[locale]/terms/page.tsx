import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Notkunarskilmálar | Bekkurinn',
    description: 'Notkunarskilmálar Bekkurins. Lestu um réttindi þín og skyldur sem notandi þjónustunnar.',
    openGraph: {
        title: 'Notkunarskilmálar Bekkurins',
        description: 'Skilmálar um notkun Bekkurins vefþjónustu.',
        type: 'website',
    },
};

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function TermsOfServicePage({ params }: PageProps) {
    const { locale } = await params;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Link
                    href={`/${locale}/login`}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Til baka
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <FileText className="text-blue-600" size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Notkunarskilmálar
                        </h1>
                    </div>

                    <div className="prose prose-gray max-w-none">
                        <p className="text-gray-600 mb-6">
                            Síðast uppfært: 23. janúar 2025
                        </p>

                        {/* Section 1: Acceptance */}
                        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                            1. Samþykki skilmála
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Með því að nota Bekkurinn samþykkir þú þessa notkunarskilmála. Ef þú samþykkir ekki skilmálana, vinsamlegast notaðu ekki þjónustuna.
                        </p>

                        {/* Section 2: Description */}
                        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                            2. Um þjónustuna
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Bekkurinn er vefþjónusta sem hjálpar foreldrum að halda utan um bekkjarsamfélagið. Þjónustan er ætluð foreldrum og forráðamönnum barna í grunnskólum á Íslandi.
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Bekkjarlisti með tengiliðaupplýsingum</li>
                            <li>Afmælisdagatal og áminningar</li>
                            <li>Viðburðaskráning og skráning í sjálfboðastörf</li>
                            <li>Óskilamunaskrá</li>
                        </ul>

                        {/* Section 3: User Responsibilities */}
                        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                            3. Ábyrgð notenda
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Sem notandi Bekkurins samþykkir þú að:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Gefa upp réttar upplýsingar um þig og fjölskyldu þína</li>
                            <li>Nota þjónustuna aðeins í þeim tilgangi sem henni er ætlað</li>
                            <li>Virða persónuvernd annarra notenda og deila ekki upplýsingum utan kerfisins</li>
                            <li>Tilkynna um villur eða öryggisbrot sem þú verður var/vör við</li>
                            <li>Nota ekki þjónustuna til ólöglegra athafna eða áreitni</li>
                        </ul>

                        {/* Section 4: Content */}
                        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                            4. Efni og gögn
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Þú átt allt efni sem þú setur inn í kerfið. Með því að setja inn efni veitir þú okkur leyfi til að geyma og sýna það öðrum meðlimum bekkjarins samkvæmt stillingunum þínum.
                        </p>
                        <p className="text-gray-600 mb-4">
                            Við áskiljum okkur rétt til að fjarlægja efni sem brýtur gegn þessum skilmálum eða íslenskum lögum.
                        </p>

                        {/* Section 5: Disclaimer */}
                        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                            5. Takmarkanir á ábyrgð
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Þjónustan er veitt „eins og hún er" og við ábyrgðumst ekki að hún verði alltaf tiltæk eða villulaus. Við berum ekki ábyrgð á:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Tapi gagna vegna tæknilegra bilana</li>
                            <li>Misnotkun annarra notenda á upplýsingum</li>
                            <li>Truflunum á þjónustu vegna viðhalds eða uppfærsla</li>
                        </ul>

                        {/* Section 6: Termination */}
                        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                            6. Uppsögn
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Þú getur hætt að nota þjónustuna hvenær sem er. Við getum lokað á aðgang þinn ef þú brýtur gegn þessum skilmálum, með eða án fyrirvara.
                        </p>

                        {/* Section 7: Changes */}
                        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                            7. Breytingar á skilmálum
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Við getum breytt þessum skilmálum hvenær sem er. Ef verulegum breytingum er gerðar munum við tilkynna notendum um það. Áframhaldandi notkun þjónustunnar eftir breytingar felur í sér samþykki á nýjum skilmálum.
                        </p>

                        {/* Section 8: Contact */}
                        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                            8. Hafa samband
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Ef þú hefur spurningar um þessa skilmála, vinsamlegast hafðu samband við okkur á{' '}
                            <a href="mailto:thorarinnhjalmarsson@gmail.com" className="text-blue-600 hover:underline">
                                thorarinnhjalmarsson@gmail.com
                            </a>
                        </p>

                        {/* Notice */}
                        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-800">
                                <strong>Athugið:</strong> Þessir skilmálar fara saman með{' '}
                                <Link href={`/${locale}/privacy`} className="underline hover:text-blue-900">
                                    persónuverndarstefnu
                                </Link>{' '}
                                okkar.
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-400 text-sm mt-8">
                    © {new Date().getFullYear()} Bekkurinn. Öll réttindi áskilin.
                </p>
            </div>
        </div>
    );
}
