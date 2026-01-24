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

    // Arrays need to be handled specially since they're stored as JSON arrays
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
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Link
                    href={`/${locale}/login`}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors"
                >
                    <ArrowLeft size={18} />
                    {t('back')}
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Shield className="text-blue-600" size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {t('title')}
                        </h1>
                    </div>

                    <div className="prose prose-gray max-w-none">
                        <p className="text-gray-600 mb-6">
                            {t('last_updated')}
                        </p>

                        {/* Section 1 */}
                        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                            {t('section1_title')}
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {t('section1_intro')}
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            {section1Items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        {/* Section 2 */}
                        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                            {t('section2_title')}
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {t('section2_intro')}
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            {section2Items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        {/* Section 3 */}
                        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                            {t('section3_title')}
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {t('section3_intro')}
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            {section3Items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        {/* Section 4 */}
                        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                            {t('section4_title')}
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {t('section4_intro')}
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            {section4Items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        {/* Section 5 */}
                        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                            {t('section5_title')}
                        </h2>
                        {t('section5_text')}{' '}
                        <a href="mailto:privacy@bekkurinn.is" className="text-blue-600 hover:underline">
                            privacy@bekkurinn.is
                        </a>
                    </p>

                    {/* Section 6: Cookies */}
                    <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                        {t('section6_title')}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {t('section6_text')}
                    </p>

                    {/* Section 7: Data Retention */}
                    <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                        {t('section7_title')}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {t('section7_text')}
                    </p>

                    {/* Notice */}
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800">
                            <strong>{t('notice_title')}</strong> {t('notice_text')}
                        </p>
                    </div>
                </div>
            </div>

            <p className="text-center text-gray-400 text-sm mt-8">
                {t('copyright')}
            </p>
        </div>
        </div >
    );
}
