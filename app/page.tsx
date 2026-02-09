import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { NavBar } from '@/components/landing/NavBar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FAQ } from '@/components/landing/FAQ';
import { CallToAction } from '@/components/landing/CallToAction';
import { Footer } from '@/components/landing/Footer';

/**
 * Home Page - Landing Page
 * 
 * Serves the landing page in Icelandic at the root URL.
 * This fixes the Google Search Console indexing issue where the redirect
 * prevented proper crawling and indexing.
 * 
 * Locale-specific landing pages are available at:
 * - /is/ (Icelandic)
 * - /en/ (English)
 * - /pl/ (Polish)
 * - etc.
 */

export default async function HomePage() {
  const locale = 'is'; // Default to Icelandic for root page

  // Fetch messages for the default locale
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AuthProvider>
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
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
