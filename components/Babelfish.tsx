'use client';

import { useState, useEffect } from 'react';
import { Languages, Info, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface BabelfishProps {
    text: string;
    originalLanguage?: string;
    targetLanguage: string;
    className?: string;
}

const DISCLAIMERS: Record<string, string> = {
    is: 'Tilkynning um þýðingu: Skilaboð eru sjálfvirkt þýdd á tungumálið þitt. Þýðingar kunna að vera ófullkomnar.',
    en: 'Translation Notice: Messages are automatically translated to your language. Translations may not be perfect.',
    pl: 'Uwaga dotycząca tłumaczenia: Wiadomości są automatycznie tłumaczone na Twój język. Tłumaczenia mogą nie być idealne.'
};

export function Babelfish({ text, originalLanguage = 'is', targetLanguage, className }: BabelfishProps) {
    // If viewing in original language, don't show translation
    // We treat 'is' as default if not specified
    if (originalLanguage === targetLanguage || !text) return null;

    const { data: translation, isLoading, error } = useQuery({
        queryKey: ['translate', text, targetLanguage],
        queryFn: async () => {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, targetLang: targetLanguage })
            });
            if (!response.ok) throw new Error('Translation failed');
            const data = await response.json();
            return data.translation as string;
        },
        staleTime: Infinity, // Translations don't change
        enabled: !!text && originalLanguage !== targetLanguage
    });

    if (isLoading) {
        return (
            <div className={`flex items-center gap-2 text-xs text-gray-400 mt-4 animate-pulse ${className}`}>
                <Loader2 size={12} className="animate-spin" />
                <span>Þýði yfir á {targetLanguage.toUpperCase()}...</span>
            </div>
        );
    }

    if (error || !translation) return null;

    return (
        <div className={`mt-6 pt-6 border-t border-gray-100 space-y-3 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-nordic-blue uppercase tracking-widest">
                    <Languages size={12} />
                    <span>Babelfish Þýðing ({targetLanguage.toUpperCase()})</span>
                </div>
                <div className="group relative">
                    <Info size={12} className="text-gray-300 hover:text-gray-400 cursor-help" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {DISCLAIMERS[targetLanguage] || DISCLAIMERS.en}
                    </div>
                </div>
            </div>

            <div className="text-gray-600 leading-relaxed italic whitespace-pre-wrap">
                {translation}
            </div>
        </div>
    );
}
