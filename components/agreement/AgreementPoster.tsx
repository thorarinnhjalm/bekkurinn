import { useTranslations } from 'next-intl';
import { AgreementSection, Agreement } from '@/types';
import { ShieldCheck, PartyPopper, MessageCircle } from 'lucide-react';

interface AgreementPosterProps {
    agreement: Agreement;
}

export function AgreementPoster({ agreement }: AgreementPosterProps) {
    const t = useTranslations('agreement');

    // Helper to find the label for a winning value
    const getWinningLabel = (item: any) => {
        if (!item.winningValue) return 'N/A';
        const opt = item.options.find((o: any) => o.value === item.winningValue);
        return opt ? t(opt.labelKey as any) : item.winningValue;
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="relative z-10 text-center mb-8">
                    <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-white/90" />
                    <h2 className="text-3xl font-black tracking-tight mb-2">
                        {t('title')}
                    </h2>
                    <p className="text-indigo-100 font-medium text-lg">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {agreement.sections.map((section) => (
                        <div key={section.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                            <div className="flex items-center gap-3 mb-3">
                                {section.id === 'birthdays' && <PartyPopper className="text-yellow-300 w-6 h-6" />}
                                {section.id === 'social' && <MessageCircle className="text-blue-300 w-6 h-6" />}
                                <h3 className="font-bold text-xl">{t(section.titleKey as any)}</h3>
                            </div>
                            <p className="text-white/80 text-sm mb-4 leading-relaxed">
                                {t(section.descriptionKey as any)}
                            </p>

                            <div className="space-y-3">
                                {section.items.map((item) => (
                                    <div key={item.id} className="bg-white/90 rounded-lg p-3 text-gray-900">
                                        <div className="text-xs font-bold text-gray-500 uppercase mb-1">
                                            {t(item.questionKey as any)}
                                        </div>
                                        <div className="font-bold text-indigo-700 text-lg">
                                            {getWinningLabel(item)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center pt-6 border-t border-white/20">
                    <div className="inline-flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-400/30">
                        <ShieldCheck className="w-4 h-4 text-green-300" />
                        <span className="font-bold text-sm text-green-100">
                            {t('poster.verified_badge')} • {new Date(agreement.updatedAt?.seconds * 1000).getFullYear()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
