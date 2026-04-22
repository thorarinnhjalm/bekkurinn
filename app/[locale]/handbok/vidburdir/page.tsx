import { Calendar, Sparkles } from 'lucide-react';

export default function EventsPage() {
    return (
        <article className="max-w-3xl mx-auto prose prose-lg bg-surface-container-lowest p-8 md:p-12 rounded-3xl shadow-ambient">
            <div className="flex items-center gap-4 mb-8 not-prose">
                <div className="w-16 h-16 bg-primary-container/20 rounded-2xl flex items-center justify-center text-primary">
                    <Sparkles size={32} />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-on-surface m-0">Hugmyndabanki</h1>
                    <p className="text-on-surface-variant mt-2 font-medium">Hvað er hægt að gera annað en að fara í bíó?</p>
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

            <div className="bg-tertiary-fixed/50 p-6 rounded-2xl not-prose my-8">
                <h3 className="font-bold text-on-tertiary-fixed mb-2">Gullna reglan</h3>
                <p className="text-on-tertiary-fixed">
                    Munið að aldrei má vera kostnaður sem útilokar börn. Ef safnað er í <strong>bekkjarsjóð</strong> (frjáls framlög) er hægt að nota hann til að niðurgreiða fyrir alla.
                </p>
            </div>

        </article>
    );
}

function EventCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="flex gap-4 p-4 bg-surface-container-low rounded-2xl ghost-border">
            <div className="mt-1 text-primary">
                <Calendar size={24} />
            </div>
            <div>
                <h3 className="font-bold text-on-surface">{title}</h3>
                <p className="text-on-surface-variant text-sm">{desc}</p>
            </div>
        </div>
    );
}
