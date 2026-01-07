'use client';

import { useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';

interface TranslationButtonProps {
    text: string;
    className?: string;
}

export function TranslationButton({ text, className = '' }: TranslationButtonProps) {
    const locale = useLocale();
    const [translation, setTranslation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    // If text is short or empty, don't show button
    if (!text || text.length < 2) return null;

    // Don't show translation if current locale is Icelandic (assuming most content is Icelandic)
    // Actually, let's allow it in case content is in another language.
    // Ideally we would detect source language, but for now we trust the user's intent.

    const handleTranslate = async () => {
        if (translation) {
            setTranslation(null); // Toggle off
            return;
        }

        setLoading(true);
        setError(false);

        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    targetLang: locale // Translate TO the user's current locale
                })
            });

            if (!res.ok) throw new Error('Failed to translate');

            const data = await res.json();
            setTranslation(data.translation);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`mt-2 ${className}`}>
            <button
                onClick={handleTranslate}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                title="Translate with AI"
            >
                {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <Languages size={14} />
                )}
                {translation ? (locale === 'is' ? 'Fela þýðingu' : 'Hide translation') : (locale === 'is' ? 'Þýða' : 'Translate')}
            </button>

            {error && (
                <span className="text-xs text-red-500 ml-2">Failed to translate</span>
            )}

            {translation && (
                <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg animate-in fade-in slide-in-from-top-1">
                    <div className="flex gap-2">
                        <div className="shrink-0 w-0.5 self-stretch bg-blue-400 rounded-full" />
                        <div>
                            <p className="text-sm text-gray-700 leading-relaxed italic">
                                "{translation}"
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">
                                AI Translated
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
