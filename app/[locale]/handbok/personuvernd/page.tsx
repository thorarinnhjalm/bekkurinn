import { Shield, Lock, EyeOff, CheckCircle } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <article className="max-w-3xl mx-auto prose prose-blue prose-lg bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-8 not-prose">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                    <Shield size={32} />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 m-0">Persónuvernd og Bekkjarlistar</h1>
                    <p className="text-gray-500 mt-2 font-medium">Hvernig höldum við úti listum án þess að brjóta lög?</p>
                </div>
            </div>

            <p className="lead">
                Með tilkomu GDPR (Persónuverndarlaga) hafa margir skólar hætt að senda út bekkjarlista með símanúmerum og heimilisföngum.
                Þetta hefur skapað vandamál fyrir foreldrastarf. Hér er lausnin.
            </p>

            <h2>Excel skjalið er hættulegt</h2>
            <p>
                Gamla aðferðin var að einn aðili tók að sér að safna upplýsingum í Excel skjal og senda það í tölvupósti á alla.
                Þetta er <strong>ekki</strong> góð ferð af nokkrum ástæðum:
            </p>
            <ul>
                <li>Skjalið úreldist strax.</li>
                <li>Það gleymist í pósthólfum og getur endað hjá röngum aðilum.</li>
                <li>Erfitt er að afskrá sig (t.d. ef fólk skilur eða flytur).</li>
            </ul>

            <h2>Samþykki er lykilatriði</h2>
            <p>
                Til að halda bekkjarlista löglega þarf <strong>upplýst samþykki</strong>. Það þýðir að foreldri verður sjálft að skrá sig og samþykkja að aðrir foreldrar sjái upplýsingarnar.
            </p>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 not-prose my-8">
                <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-4">
                    <Lock size={20} />
                    Hvernig Bekkurinn leysir málið
                </h3>
                <p className="text-blue-800 mb-4">
                    Í kerfinu okkar er bekkjarlistinn "lifandi". Foreldrar skrá sig sjálfir.
                </p>
                <div className="grid gap-3">
                    <FeatureRow text="Foreldrar stjórna sýnileika sínum (hægt að fela símanúmer)" />
                    <FeatureRow text="Engin Excel skjöl á flakki - gögnin eru læst inni í kerfinu" />
                    <FeatureRow text="Aðeins staðfestir foreldrar í bekknum sjá listann" />
                </div>
            </div>

            <h2>Myndbirtingar</h2>
            <p>
                Skólar mega almennt ekki birta myndir af börnum nema með leyfi. Sama gildir um foreldrafélög.
                Ef þið takið myndir í bekkjapartýum:
            </p>
            <ol>
                <li>Ekki deila þeim á opnum samfélagsmiðlum (Instagram/Facebook Public).</li>
                <li>Notið lokaða hópa (eins og Bekkurinn appið eða lokaðan Facebook hóp).</li>
                <li>Virðið ef foreldrar biðja um að mynd sé tekin út.</li>
            </ol>

        </article>
    );
}

function FeatureRow({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 text-blue-900 font-medium">
            <CheckCircle size={18} className="text-blue-500" />
            <span>{text}</span>
        </div>
    )
}
