'use client';

import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

/**
 * Hafðu samband.
 *
 * Formið sem skrifaði nafn og netfang í Firestore var tekið út þegar gamla
 * forritinu var lokað (nóvember 2026). Eftir stendur netfangið.
 */
export default function ContactPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'is';

    return (
        <div className="min-h-screen bg-surface py-12 px-4">
            <div className="max-w-xl mx-auto space-y-8">
                {/* Back Link */}
                <Link
                    href={`/${locale}`}
                    className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                    <ArrowLeft size={18} />
                    Til baka
                </Link>

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto">
                        <Mail className="text-primary" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-on-surface">Hafðu samband</h1>
                    <p className="text-on-surface-variant">
                        Ertu með spurningu, ábendingu eða tillögu? Við hlökkum til að heyra frá þér!
                    </p>
                </div>

                {/* Email */}
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-6 text-center text-on-surface-variant">
                    <p>
                        Sendu okkur tölvupóst á{' '}
                        <a
                            href="mailto:thorarinnhjalmarsson@gmail.com"
                            className="text-primary hover:underline font-medium"
                        >
                            thorarinnhjalmarsson@gmail.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
