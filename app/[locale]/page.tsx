'use client';

import { useParams } from 'next/navigation';
import { NavBar } from '@/components/landing/NavBar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FAQ } from '@/components/landing/FAQ';
import { CallToAction } from '@/components/landing/CallToAction';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
    const params = useParams();
    const locale = (params.locale as string) || 'is';

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
            <NavBar locale={locale} />
            <main>
                <Hero locale={locale} />
                <Features />
                <HowItWorks locale={locale} />
                <FAQ />
                <CallToAction locale={locale} />
                <Footer />
            </main>
        </div>
    );
}

