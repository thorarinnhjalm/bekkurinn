'use client';

import { TopHeader } from '@/components/navigation/TopHeader';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';

import { useParams } from 'next/navigation';

export default function HandbookLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const params = useParams();
    const locale = params.locale as string;

    return (
        <div className="min-h-screen flex flex-col bg-stone-50">
            <TopHeader
                className=""
            />

            <main className="flex-grow pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <nav className="flex mb-8 text-sm font-medium text-gray-500">
                        <Link href={`/${params.locale}`} className="hover:text-gray-900 transition-colors">
                            Heim
                        </Link>
                        <span className="mx-2">/</span>
                        <Link href={`/${params.locale}/handbok`} className="hover:text-gray-900 transition-colors">
                            Handbók
                        </Link>
                    </nav>

                    {children}
                </div>
            </main>

            <footer className="bg-white border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500">
                        © {new Date().getFullYear()} Bekkurinn. Gagnlegar upplýsingar fyrir foreldra.
                    </p>
                </div>
            </footer>
        </div>
    );
}
