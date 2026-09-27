import { useTranslations } from 'next-intl';
import { Agreement, AgreementItem } from '@/types';
import { ShieldCheck, PartyPopper, Info, Calendar, Smartphone, Gamepad2, Users, CheckCircle2 } from 'lucide-react';

interface AgreementPosterProps {
    agreement: Agreement;
    signaturesCount?: number;
}

export function AgreementPoster({ agreement }: AgreementPosterProps) {
    const t = useTranslations('agreement');

    const cleanKey = (key: string) => key?.replace(/^agreement\./, '') || '';

    const renderText = (key: string) => {
        const cleaned = cleanKey(key);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const translated = t(cleaned as any);
        return translated.startsWith('agreement.') ? cleaned : translated;
    };

    const getWinningLabel = (item: AgreementItem) => {
        if (!item.winningValue) return 'N/A';
        if (item.type === 'info') {
            return renderText(item.questionKey);
        }

        const winningOption = item.options?.find((opt) => opt.value === item.winningValue);
        if (winningOption) {
            return renderText(winningOption.labelKey);
        }

        return String(item.winningValue);
    };

    const getIcon = (sectionId: string) => {
        if (sectionId.includes('birthday')) return <PartyPopper size={14} />;
        if (sectionId.includes('social')) return <Users size={14} />;
        if (sectionId.includes('kopavogur') || sectionId.includes('phonefree')) return <Smartphone size={14} />;
        if (sectionId.includes('gaming')) return <Gamepad2 size={14} />;
        if (sectionId.includes('screen')) return <Smartphone size={14} />;
        return <CheckCircle2 size={14} />;
    };

    const schoolYear = new Date(agreement.updatedAt?.seconds ? agreement.updatedAt.seconds * 1000 : 0).getFullYear();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/15 text-primary text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck size={14} />
                    {t('poster.verified_badge')}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">
                    {t('title')}
                </h2>
                <p className="text-on-surface-variant font-medium leading-relaxed">
                    {t('subtitle')}
                </p>
            </div>

            {/* Poster Card */}
            <div className="bg-surface-container-lowest rounded-3xl shadow-ambient overflow-hidden">
                <div className="grid lg:grid-cols-2">
                    {agreement.sections.map((section, sIdx) => (
                        <div
                            key={section.id}
                            className={`p-8 ${sIdx === 0 && agreement.sections.length > 1 ? 'lg:border-r border-outline-variant/30' : ''} ${sIdx > 0 ? 'border-t lg:border-t-0 border-outline-variant/30' : ''} ${section.isMunicipalityMandated ? 'bg-secondary-container/30' : ''}`}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-ambient ${section.isMunicipalityMandated ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-primary'}`}>
                                    {getIcon(section.id)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-on-surface">{renderText(section.titleKey)}</h3>
                                    {section.isMunicipalityMandated && (
                                        <p className="text-xs text-secondary font-semibold mt-0.5">Kópavogsbær</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 text-left">
                                {section.items.map((item) => (
                                    <div key={item.id} className={`group p-4 rounded-xl transition-all duration-300 ${item.type === 'info' ? 'bg-secondary-container/30' : 'bg-surface-container-low hover:bg-surface-container-high'}`}>
                                        {item.type !== 'info' && (
                                            <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                {renderText(item.questionKey)}
                                            </div>
                                        )}
                                        <div className={`font-bold flex items-center gap-2 ${item.type === 'info' ? 'text-base text-on-surface' : 'text-lg text-primary'}`}>
                                            {item.type !== 'info' && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(18,54,46,0.5)]" />
                                            )}
                                            {getWinningLabel(item)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="bg-surface-container-low p-6 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-ambient">
                            <Calendar size={14} className="text-on-surface-variant" />
                        </div>
                        <span className="text-sm font-bold text-on-surface-variant">
                            Gildir fyrir skólaárið {schoolYear}-{schoolYear + 1}
                        </span>
                    </div>
                    <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                        Staðfest af foreldrum • {agreement.classId}
                    </div>
                </div>
            </div>

            {/* Action Tip */}
            <div className="flex items-center justify-center gap-2 text-on-surface-variant">
                <Info size={14} />
                <p className="text-xs font-medium">Þessi sáttmáli er bindandi samkomulag foreldrahópsins.</p>
            </div>
        </div>
    );
}
