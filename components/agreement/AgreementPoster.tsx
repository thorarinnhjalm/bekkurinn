import { useTranslations } from 'next-intl';
import { Agreement } from '@/types';
import { ShieldCheck, PartyPopper, MessageCircle, Info, Calendar, Smartphone, Gamepad2, Gift, Users, CheckCircle2 } from 'lucide-react';

interface AgreementPosterProps {
    agreement: Agreement;
    signaturesCount?: number;
}

export function AgreementPoster({ agreement, signaturesCount }: AgreementPosterProps) {
    const t = useTranslations('agreement');

    const cleanKey = (key: string) => key?.replace(/^agreement\./, '') || '';

    const renderText = (key: string) => {
        const cleaned = cleanKey(key);
        const translated = t(cleaned as any);
        return translated.startsWith('agreement.') ? cleaned : translated;
    };

    // Helper to find the label for a winning value
    const getWinningLabel = (item: any) => {
        if (!item.winningValue) return 'N/A';
        const opt = item.options.find((o: any) => o.value === item.winningValue);
        return opt ? renderText(opt.labelKey) : item.winningValue;
    };

    const getIcon = (sectionId: string) => {
        switch (sectionId) {
            case 'birthdays': return <PartyPopper className="text-pink-500" size={20} />;
            case 'social': return <Smartphone className="text-indigo-500" size={20} />;
            default: return <Info className="text-blue-500" size={20} />;
        }
    };

    const getItemIcon = (itemId: string) => {
        if (itemId.includes('gift')) return <Gift size={14} />;
        if (itemId.includes('invit')) return <Users size={14} />;
        if (itemId.includes('gaming')) return <Gamepad2 size={14} />;
        if (itemId.includes('screen')) return <Smartphone size={14} />;
        return <CheckCircle2 size={14} />;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck size={14} />
                    {t('poster.verified_badge')}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                    {t('title')}
                </h2>
                <p className="text-gray-500 font-medium leading-relaxed">
                    {t('subtitle')}
                </p>
            </div>

            {/* Poster Card */}
            <div className="professional-card overflow-hidden bg-white border-none shadow-xl ring-1 ring-gray-200">
                <div className="grid lg:grid-cols-2">
                    {agreement.sections.map((section, sIdx) => (
                        <div
                            key={section.id}
                            className={`p-8 ${sIdx === 0 && agreement.sections.length > 1 ? 'lg:border-r border-gray-100' : ''} ${sIdx > 0 ? 'border-t lg:border-t-0 border-gray-100' : ''}`}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                                    {getIcon(section.id)}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{renderText(section.titleKey)}</h3>
                            </div>

                            <div className="space-y-4 text-left">
                                {section.items.map((item) => (
                                    <div key={item.id} className="group p-4 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                            {renderText(item.questionKey)}
                                        </div>
                                        <div className="text-lg font-bold text-trust-navy flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            {getWinningLabel(item)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="bg-gray-50/80 p-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                            <Calendar size={14} className="text-gray-400" />
                        </div>
                        <span className="text-sm font-bold text-gray-500">
                            Gildir fyrir skólaárið {new Date(agreement.updatedAt?.seconds * 1000 || Date.now()).getFullYear()}-{new Date(agreement.updatedAt?.seconds * 1000 || Date.now()).getFullYear() + 1}
                        </span>
                    </div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Staðfest af foreldrum • {agreement.classId}
                    </div>
                </div>
            </div>

            {/* Action Tip */}
            <div className="flex items-center justify-center gap-2 text-gray-400">
                <Info size={14} />
                <p className="text-xs font-medium">Þessi sáttmáli er bindandi samkomulag foreldrahópsins.</p>
            </div>
        </div>
    );
}
