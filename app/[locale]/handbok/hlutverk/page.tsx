import { CheckCircle, AlertTriangle, Users } from 'lucide-react';

export default function RolePage() {
    return (
        <article className="max-w-3xl mx-auto prose prose-blue prose-lg bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-8 not-prose">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-nordic-blue">
                    <Users size={32} />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 m-0">Hlutverk Bekkjarfulltrúa</h1>
                    <p className="text-gray-500 mt-2 font-medium">Hvað gerir góður bekkjarfulltrúi?</p>
                </div>
            </div>

            <p className="lead">
                Bekkjarfulltrúar eru lykillinn að góðum bekkjaranda. Þeir eru tengiliðir milli foreldra og skóla,
                og standa fyrir viðburðum sem styrkja félagsleg tengsl nemenda.
            </p>

            <h2>Hvað gerir bekkjarfulltrúi?</h2>
            <p>
                Hlutverk bekkjarfulltrúa er ekki njörvað niður í lög, en hefð hefur skapast fyrir ákveðnum verkefnum.
                Aðalmarkmiðið er alltaf að stuðla að <strong>velferð og vellíðan nemenda</strong> með því að efla samstarf heimila.
            </p>

            <div className="not-prose grid gap-4 my-8">
                <AdviceCard
                    title="Halda bekkjarfundi"
                    text="Kalla saman foreldra 1-2 sinnum á vetri til að ræða bekkjarbrag og skipuleggja starfið."
                />
                <AdviceCard
                    title="Skipuleggja viðburði"
                    text="Fara í leikhús, halda bekkjarkvöld eða skipuleggja útilegu. Markmiðið er að hópurinn hittist utan skólatíma."
                />
                <AdviceCard
                    title="Miðla upplýsingum"
                    text="Vera tengiliður við umsjónarkennara og koma upplýsingum frá foreldrafélagi skólans til foreldra bekkjarins."
                />
            </div>

            <h2>Hvað gerir bekkjarfulltrúi EKKI?</h2>
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 not-prose mb-8">
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                        <span className="text-amber-900"><strong>Leysa úr einelti:</strong> Slík mál eiga alltaf að fara beint til umsjónarkennara eða stjórnenda skóla.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                        <span className="text-amber-900"><strong>Safna skyldugjöldum:</strong> Það er ólöglegt að krefja foreldra um gjöld. Öll framlög í bekkjarsjóði verða að vera frjáls.</span>
                    </li>
                </ul>
            </div>

            <h2>Hvernig eru bekkjarfulltrúar valdir?</h2>
            <p>
                Mismunandi hefðir eru í skólum. Algengast er að kosið sé á fyrsta samráðsfundi haustsins.
                Gott er að miða við að <strong>2-3 foreldrar</strong> séu bekkjarfulltrúar saman. Það dreifir álaginu og gerir starfið skemmtilegra.
            </p>

            <blockquote>
                "Öflugt foreldrastarf skilar sér beint í betri líðan og námsárangri barna."
                <footer>— Heimili og skóli</footer>
            </blockquote>

        </article>
    );
}

function AdviceCard({ title, text }: { title: string, text: string }) {
    return (
        <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="mt-1 text-green-600">
                <CheckCircle size={24} />
            </div>
            <div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-gray-600 text-sm">{text}</p>
            </div>
        </div>
    )
}
