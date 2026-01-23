'use client';

import { useState } from 'react';
import { ArrowLeft, Send, Mail, MessageSquare, HelpCircle, Bug, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type ContactReason = 'question' | 'bug' | 'feature' | 'other';

export default function ContactPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'is';

    const [reason, setReason] = useState<ContactReason>('question');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reasonOptions = [
        { value: 'question', label: 'Spurning', icon: HelpCircle, description: 'Almennar fyrirspurnir' },
        { value: 'bug', label: 'Villa', icon: Bug, description: 'Tilkynna villu í kerfinu' },
        { value: 'feature', label: 'Hugmynd', icon: Lightbulb, description: 'Tillögur að nýjum eiginleikum' },
        { value: 'other', label: 'Annað', icon: MessageSquare, description: 'Allt annað' },
    ] as const;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !message) {
            setError('Vinsamlegast fylltu út öll svæði.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Create a mailto link as a fallback (no backend email service configured)
            const subject = encodeURIComponent(`[Bekkurinn - ${reasonOptions.find(r => r.value === reason)?.label}] Skilaboð frá ${name}`);
            const body = encodeURIComponent(`Nafn: ${name}\nNetfang: ${email}\nÁstæða: ${reasonOptions.find(r => r.value === reason)?.label}\n\nSkilaboð:\n${message}`);

            // For now, open mailto link
            window.location.href = `mailto:thorarinnhjalmarsson@gmail.com?subject=${subject}&body=${body}`;

            setIsSubmitted(true);
        } catch (err) {
            setError('Villa kom upp. Vinsamlegast reyndu aftur.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <div className="w-full max-w-md text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Send className="text-green-600" size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Takk fyrir skilaboðin!</h1>
                    <p className="text-gray-600">
                        Við munum svara eins fljótt og auðið er.
                    </p>
                    <Link
                        href={`/${locale}/login`}
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        Til baka á forsíðu
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-xl mx-auto space-y-8">
                {/* Back Link */}
                <Link
                    href={`/${locale}/login`}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Til baka
                </Link>

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <Mail className="text-blue-600" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Hafðu samband</h1>
                    <p className="text-gray-600">
                        Ertu með spurningu, ábendingu eða tillögu? Við hlökkum til að heyra frá þér!
                    </p>
                </div>

                {/* Contact Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
                    {/* Reason Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Hvað varðar erindið?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {reasonOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setReason(option.value)}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                                            reason === option.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon
                                                size={20}
                                                className={reason === option.value ? 'text-blue-600' : 'text-gray-400'}
                                            />
                                            <div>
                                                <p className={`font-semibold ${reason === option.value ? 'text-blue-700' : 'text-gray-700'}`}>
                                                    {option.label}
                                                </p>
                                                <p className="text-xs text-gray-500">{option.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nafn
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                            placeholder="Jón Jónsson"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Netfang
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                            placeholder="jon@example.com"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Skilaboð
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none"
                            placeholder="Skrifaðu skilaboðin þín hér..."
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send size={18} />
                                Senda skilaboð
                            </>
                        )}
                    </button>
                </form>

                {/* Alternative Contact */}
                <div className="text-center text-sm text-gray-500">
                    <p>
                        Eða sendu okkur tölvupóst beint á{' '}
                        <a
                            href="mailto:thorarinnhjalmarsson@gmail.com"
                            className="text-blue-600 hover:underline"
                        >
                            thorarinnhjalmarsson@gmail.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
