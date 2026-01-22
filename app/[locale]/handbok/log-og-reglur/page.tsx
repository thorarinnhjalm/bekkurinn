import { BookOpen, Scale, FileText } from 'lucide-react';

export default function LawsPage() {
    return (
        <article className="max-w-3xl mx-auto prose prose-blue prose-lg bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-8 not-prose">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                    <Scale size={32} />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 m-0">Lög og Reglugerðir</h1>
                    <p className="text-gray-500 mt-2 font-medium">Hvaða lög gilda um foreldrastarf?</p>
                </div>
            </div>

            <p className="lead">
                Foreldrastarf í grunnskólum er ekki bara góðmennska, það er lögfest í grunnskólalögum. Hér er yfirlit yfir helstu ákvæði.
            </p>

            <h2>Lög um grunnskóla nr. 91/2008</h2>
            <p>
                Í <strong>9. grein</strong> laganna segir:
            </p>
            <blockquote className="italic border-l-4 border-amber-300 pl-4 py-2 bg-amber-50 rounded-r-lg">
                "Við hvern grunnskóla skal starfa foreldrafélag. Skólastjóri sér til þess að félagið sé stofnað og að því sé búin aðstaða."
            </blockquote>
            <p>
                Þetta þýðir að skólinn ber ábyrgð á að foreldrafélag sé til staðar.
            </p>

            <h2>Reglugerð um foreldrafélög</h2>
            <p>
                Í reglugerð nr. 897/2009 er kveðið nánar á um hlutverkið:
            </p>
            <ul>
                <li>Að vera samstarfsvettvangur foreldra.</li>
                <li>Að styðja við skólastarfið.</li>
                <li>Að stuðla að velferð nemenda.</li>
            </ul>

            <h2>Aðalnámskrá Grunnskóla</h2>
            <p>
                Í aðalnámskrá (kafla 4.3) er lögð áhersla á að foreldrar séu virkir þátttakendur. Þar segir að skólar eigi að hafa frumkvæði að upplýsingagjöf til foreldra.
            </p>

            <div className="not-prose mt-12 space-y-4">
                <h3 className="font-bold text-gray-900 border-b pb-2">Gagnlegir hlekkir (Opnast í nýjum glugga)</h3>

                <a href="https://www.althingi.is/lagasige/lys/2008091.html" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-amber-50 hover:text-amber-800 transition-colors group">
                    <FileText className="text-gray-400 group-hover:text-amber-600" />
                    <span className="font-medium">Lög um grunnskóla nr. 91/2008</span>
                </a>

                <a href="https://island.is/reglugerdir/nr/0897-2009" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-amber-50 hover:text-amber-800 transition-colors group">
                    <FileText className="text-gray-400 group-hover:text-amber-600" />
                    <span className="font-medium">Reglugerð um foreldrafélög og foreldraráð</span>
                </a>

                <a href="https://heimiliogskoli.is" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-amber-50 hover:text-amber-800 transition-colors group">
                    <FileText className="text-gray-400 group-hover:text-amber-600" />
                    <span className="font-medium">Heimili og skóli - Landssamtök foreldra</span>
                </a>
            </div>

        </article>
    );
}
