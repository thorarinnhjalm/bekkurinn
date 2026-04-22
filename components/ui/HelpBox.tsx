'use client';

import { Lightbulb, AlertCircle, Info } from 'lucide-react';

interface HelpBoxProps {
    title: string;
    tips: string[];
    variant?: 'info' | 'tip' | 'warning';
}

/**
 * HelpBox Component
 * 
 * Contextual help box for providing tips and guidance on complex pages.
 * Uses warm, encouraging Icelandic copy.
 */
export function HelpBox({ title, tips, variant = 'tip' }: HelpBoxProps) {
    const variants = {
        tip: {
            bg: 'bg-primary-container/15',
            border: 'border-primary/30',
            icon: <Lightbulb className="text-primary" size={20} />,
            titleColor: 'text-primary',
            textColor: 'text-primary',
        },
        info: {
            bg: 'bg-surface',
            border: 'border-outline-variant/30',
            icon: <Info className="text-on-surface-variant" size={20} />,
            titleColor: 'text-on-surface',
            textColor: 'text-on-surface',
        },
        warning: {
            bg: 'bg-tertiary-fixed/40',
            border: 'border-tertiary/40',
            icon: <AlertCircle className="text-on-tertiary-fixed" size={20} />,
            titleColor: 'text-on-tertiary-fixed',
            textColor: 'text-on-tertiary-fixed',
        },
    };

    const style = variants[variant];

    return (
        <div className={`${style.bg} border ${style.border} rounded-xl p-5 space-y-3`}>
            {/* Header */}
            <div className="flex items-center gap-2">
                {style.icon}
                <h3 className={`font-semibold ${style.titleColor}`}>{title}</h3>
            </div>

            {/* Tips List */}
            <ul className="space-y-2">
                {tips.map((tip, index) => (
                    <li key={index} className={`text-sm ${style.textColor} flex items-start gap-2`}>
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span className="flex-1">{tip}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
