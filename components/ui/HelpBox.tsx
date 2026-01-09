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
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: <Lightbulb className="text-blue-600" size={20} />,
            titleColor: 'text-blue-900',
            textColor: 'text-blue-800',
        },
        info: {
            bg: 'bg-gray-50',
            border: 'border-gray-200',
            icon: <Info className="text-gray-600" size={20} />,
            titleColor: 'text-gray-900',
            textColor: 'text-gray-700',
        },
        warning: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            icon: <AlertCircle className="text-amber-600" size={20} />,
            titleColor: 'text-amber-900',
            textColor: 'text-amber-800',
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
                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                        <span className="flex-1">{tip}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
