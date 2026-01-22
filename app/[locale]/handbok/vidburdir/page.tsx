import { Calendar, Music, Sparkles } from 'lucide-react';

export default function EventsPage() {
    return (
        <article className="max-w-3xl mx-auto prose prose-blue prose-lg bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-8 not-prose">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                    <Sparkles size={32} />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 m-0">Hugmyndabanki</h1>
                    <p className="text-gray-500 mt-2 font-medium">Hvað er hægt að gera annað en að fara í bíó?</p>
                </div>
            </div>

            <p className="lead">
                Að hittast utan skóla styrkir tengslin og minnkar líkur á einelti. Hér eru hugmyndir að viðburðum sem kosta lítið sem ekkert.
            </p>

            <h2>Fyrir yngstu börnin (1.-4. bekkur)</h2>
            <div className="not-prose grid gap-4 mb-8">
                <EventCard
                    title="Ratleikur í hverfinu"
                    desc="Eftir skóla eða um helgi. Foreldrar fela vísbendingar. Endar með kakó."
                />
                <EventCard
                    title="Hjóla/Spark bretta hittingur"
                    desc="Hittast á skólalóðinni kl. 17:00. Allir koma með sín tæki. Foreldrar spjalla."
                />
                <EventCard
                    title="Spilakvöld í skólanum"
                    desc="Fáið lánaða stofu í skólanum. Hver kemur með eitt spil að heiman."
                />
            </div>

            <h2>Fyrir miðstig (5.-7. bekkur)</h2>
            <div className="not-prose grid gap-4 mb-8">
                <EventCard
                    title="Sundferð"
                    desc="Hittast í sundlaug hverfisins. Ódýrt og allir kunna."
                />
                <EventCard
                    title="Gölluð í Keilu"
                    desc="Skipta niður í lið þannig að krakkarnir blandist, ekki bara bestu vinirnir saman."
                />
            </div>

            <h2>Fyrir unglingastig (8.-10. bekkur)</h2>
            <p>
                Hér dregur úr þátttöku foreldra, en mikilvægt er að foreldrar standi vaktina (séu sýnilegir en ekki yfirþyrmandi).
            </p>
            <div className="not-prose grid gap-4">
                <EventCard
                    title="Pizzuveisla í félagsmiðstöð"
                    desc="Samstarf við félagsmiðstöðina. Oft hægt að fá inni þar."
                />
                <EventCard
                    title="Lazertag / Keila"
                    desc="Vinsælt en kostar pening. Huga þarf að þeim sem hafa ekki efni á."
                />
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 not-prose my-8">
                <h3 className="font-bold text-blue-900 mb-2">Gullna reglan</h3>
                <p className="text-blue-800">
                    Munið að aldrei má vera kostnaður sem útilokar börn. Ef safnað er í <strong>bekkjarsjóð</strong> (frjáls framlög) er hægt að nota hann til að niðurgreiða fyrir alla.
                </p>
            </div>

        </article>
    );
}

function EventCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="mt-1 text-green-600">
                <Calendar size={24} />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
            </div>
        </div>
    )
}
