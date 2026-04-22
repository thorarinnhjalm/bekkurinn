'use client';

import { NavBar } from '@/components/landing/NavBar';
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
        <div className="min-h-screen flex flex-col bg-surface text-on-surface">
            <NavBar locale={locale} />

            <main className="flex-grow pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <nav className="flex mb-8 text-sm font-medium text-on-surface-variant">
                        <Link href={`/${params.locale}`} className="hover:text-primary transition-colors">
                            Heim
                        </Link>
                        <span className="mx-2">/</span>
                        <Link href={`/${params.locale}/handbok`} className="hover:text-primary transition-colors">
                            Handbók
                        </Link>
                    </nav>

                    {children}
                </div>
            </main>

            <footer className="bg-surface-container-low border-t border-outline-variant/30 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-on-surface-variant">
                        © {new Date().getFullYear()} Bekkurinn. Gagnlegar upplýsingar fyrir foreldra.
                    </p>
                </div>
            </footer>
        </div>
    );
}
