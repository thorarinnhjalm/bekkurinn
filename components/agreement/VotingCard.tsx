import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Loader2 } from 'lucide-react';
import { AgreementItem } from '@/types';

interface VotingCardProps {
    item: AgreementItem;
    existingVote?: string | number;
    onVote: (value: string | number) => Promise<void>;
    isVotingOpen: boolean;
}

export function VotingCard({ item, existingVote, onVote, isVotingOpen }: VotingCardProps) {
    const t = useTranslations('agreement');
    const [submitting, setSubmitting] = useState(false);
    const [localVote, setLocalVote] = useState(existingVote);

    const handleVote = async (value: string | number) => {
        if (!isVotingOpen || submitting) return;
        setSubmitting(true);
        try {
            await onVote(value);
            setLocalVote(value);
        } catch (error) {
            console.error("Failed to vote", error);
        } finally {
            setSubmitting(false);
        }
    };

    const renderText = (key: string) => {
        const cleaned = cleanKey(key);
        const translated = t(cleaned as any);
        // If translation appears to be missing (returns key with namespace), return the raw text
        return translated.startsWith('agreement.') ? cleaned : translated;
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4 transition-all hover:shadow-md">
            <h3 className="font-bold text-lg text-gray-900 mb-2">
                {renderText(item.questionKey)}
            </h3>

            <div className="space-y-2 mt-4">
                {item.options.map((option) => {
                    const isSelected = localVote === option.value;
                    return (
                        <button
                            key={option.value}
                            onClick={() => handleVote(option.value)}
                            disabled={!isVotingOpen || submitting}
                            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-between
                                ${isSelected
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                                    : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                                }
                                ${!isVotingOpen ? 'opacity-70 cursor-not-allowed' : ''}
                            `}
                        >
                            <span className="font-medium">{renderText(option.labelKey)}</span>
                            {submitting && isSelected ? (
                                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                            ) : isSelected ? (
                                <Check className="w-5 h-5 text-indigo-600" />
                            ) : null}
                        </button>
                    );
                })}
            </div>

            {existingVote && isVotingOpen && (
                <p className="text-xs text-center text-gray-400 mt-3 font-medium uppercase tracking-wide">
                    {t('your_vote')}
                </p>
            )}
        </div>
    );
}
