'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Privacy Policy Page
 *
 * Internationalized privacy information page for Bekkurinn.
 * Uses next-intl for translations like all other pages.
 */

export default function PrivacyPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'is';
    const t = useTranslations('privacy_page');

    const section1Items = [
        t('section1_items.0'),
        t('section1_items.1'),
        t('section1_items.2'),
        t('section1_items.3'),
    ];

    const section2Items = [
        t('section2_items.0'),
        t('section2_items.1'),
        t('section2_items.2'),
        t('section2_items.3'),
    ];

    const section3Items = [
        t('section3_items.0'),
        t('section3_items.1'),
        t('section3_items.2'),
    ];

    const section4Items = [
        t('section4_items.0'),
        t('section4_items.1'),
        t('section4_items.2'),
        t('section4_items.3'),
    ];

    return (
        <div className="min-h-screen bg-surface p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Link
                    href={`/${locale}/login`}
                    className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8 transition-colors font-medium"
                >
                    <ArrowLeft size={18} />
                    {t('back')}
                </Link>

                <div className="bg-surface-container-lowest rounded-3xl shadow-ambient p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-secondary-container rounded-2xl flex items-center justify-center">
                            <Shield className="text-on-secondary-container" size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-on-surface">
                            {t('title')}
                        </h1>
                    </div>

                    <div className="prose prose-lg max-w-none">
                        <p className="text-on-surface-variant mb-6">
                            {t('last_updated')}
                        </p>

                        <h2 className="text-lg font-semibold text-on-surface mt-6 mb-3">
                            {t('section1_title')}
                        </h2>
                        <p className="text-on-surface-variant mb-4">
                            {t('section1_intro')}
                        </p>
                        <ul className="list-disc pl-6 text-on-surface-variant space-y-2 mb-4">
                            {section1Items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        <h2 className="text-lg font-semibold text-on-surface mt-6 mb-3">
                            {t('section2_title')}
                        </h2>
                        <p className="text-on-surface-variant mb-4">
                            {t('section2_intro')}
                        </p>
                        <ul className="list-disc pl-6 text-on-surface-variant space-y-2 mb-4">
                            {section2Items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        <h2 className="text-lg font-semibold text-on-surface mt-6 mb-3">
                            {t('section3_title')}
                        </h2>
                        <p className="text-on-surface-variant mb-4">
                            {t('section3_intro')}
                        </p>
                        <ul className="list-disc pl-6 text-on-surface-variant space-y-2 mb-4">
                            {section3Items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        <h2 className="text-lg font-semibold text-on-surface mt-6 mb-3">
                            {t('section4_title')}
                        </h2>
                        <p className="text-on-surface-variant mb-4">
                            {t('section4_intro')}
                        </p>
                        <ul className="list-disc pl-6 text-on-surface-variant space-y-2 mb-4">
                            {section4Items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        <h2 className="text-lg font-semibold text-on-surface mt-6 mb-3">
                            {t('section5_title')}
                        </h2>
                        <p className="text-on-surface-variant mb-4">
                            {t('section5_text')}{' '}
                            <a href="mailto:privacy@bekkurinn.is" className="text-primary hover:underline font-medium">
                                privacy@bekkurinn.is
                            </a>
                        </p>

                        <h2 className="text-lg font-semibold text-on-surface mt-6 mb-3">
                            {t('section6_title')}
                        </h2>
                        <p className="text-on-surface-variant mb-4">
                            {t('section6_text')}
                        </p>

                        <h2 className="text-lg font-semibold text-on-surface mt-6 mb-3">
                            {t('section7_title')}
                        </h2>
                        <p className="text-on-surface-variant mb-4">
                            {t('section7_text')}
                        </p>

                        <div className="mt-8 p-4 bg-primary-container/15 rounded-2xl">
                            <p className="text-sm text-on-surface">
                                <strong className="text-primary">{t('notice_title')}</strong> {t('notice_text')}
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-on-surface-variant text-sm mt-8">
                    {t('copyright')}
                </p>
            </div>
        </div>
    );
}
