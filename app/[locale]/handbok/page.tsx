import { Newspaper, BookOpen, Users, Milestone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function HandbookIndex({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                    Handbók <span className="text-nordic-blue">Bekkjarfulltrúans</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Hagnýtar upplýsingar, lög, reglur og góð ráð fyrir öflugt foreldrastarf.
                    Byggt á lögum um grunnskóla og efni frá Heimili og skóla.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
                <Card
                    icon={<Users className="w-8 h-8 text-blue-600" />}
                    title="Hlutverk Bekkjarfulltrúa"
                    description="Hver er ábyrgðin? Hvað segja lögin? Hvernig kjósum við fulltrúa?"
                    href={`/${locale}/handbok/hlutverk`}
                />
                <Card
                    icon={<Newspaper className="w-8 h-8 text-purple-600" />}
                    title="Persónuvernd & Bekkjarlistar"
                    description="Hvernig höldum við úti bekkjarlistum löglega? GDPR og myndbirtingar."
                    href={`/${locale}/handbok/personuvernd`}
                />
                <Card
                    icon={<Milestone className="w-8 h-8 text-emerald-600" />}
                    title=" Hugmyndabanki að viðburðum"
                    description="Hvað er hægt að gera annað en að fara í bíó? Hugmyndir fyrir alla aldurshópa."
                    href={`/${locale}/handbok/vidburdir`}
                />
                <Card
                    icon={<BookOpen className="w-8 h-8 text-amber-600" />}
                    title="Lög og Reglugerðir"
                    description="Grunnskólalög nr. 91/2008, Aðalnámskrá og reglugerðir um foreldrafélög."
                    href={`/${locale}/handbok/log-og-reglur`}
                />
            </div>

            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
                <h3 className="font-bold text-lg text-blue-900 mb-4">Heimildir og gagnlegir tenglar</h3>
                <ul className="space-y-3 text-blue-800">
                    <SourceLink href="https://www.althingi.is/lagasige/lys/2008091.html" title="Lög um grunnskóla nr. 91/2008" />
                    <SourceLink href="https://island.is/reglugerdir/nr/0897-2009" title="Reglugerð um foreldrafélög og foreldraráð" />
                    <SourceLink href="https://www.heimiliogskoli.is" title="Heimili og skóli - Landssamtök foreldra" />
                </ul>
            </div>
        </div>
    );
}

function Card({ icon, title, description, href }: { icon: any, title: string, description: string, href: string }) {
    return (
        <Link href={href} className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all">
            <div className="bg-gray-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-nordic-blue transition-colors">
                {title}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
                {description}
            </p>
            <div className="flex items-center text-nordic-blue font-bold text-sm">
                Lesa nánar <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    );
}

function SourceLink({ href, title }: { href: string, title: string }) {
    return (
        <li className="flex items-center gap-2 hover:underline">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            <a href={href} target="_blank" rel="noopener noreferrer">{title}</a>
        </li>
    )
}
