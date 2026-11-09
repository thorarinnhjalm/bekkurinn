import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PublicAnalytics } from "@/components/analytics/PublicAnalytics";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bekkurinn.is'),
  title: {
    default: "Bekkurinn - Kerfi fyrir bekkjarfulltrúa",
    template: "%s | Bekkurinn"
  },
  description: "Skipulagt kerfi fyrir bekkjarfulltrúa á Íslandi. Róleg, einföld lausn til að skipuleggja foreldrafélag bekkjarins, safna í sjóði og halda utan um viðburði.",
  keywords: ["bekkjarfulltrúi", "foreldrafélag", "skóli", "Iceland", "class representative", "foreldrar", "grunnskóli"],
  authors: [{ name: "Bekkurinn" }],
  openGraph: {
    title: "Bekkurinn - Kerfi fyrir bekkjarfulltrúa",
    description: "Allt sem þú þarft fyrir bekkinn á einum stað. Nafnalistar, tilkynningar og viðburðir.",
    url: 'https://www.bekkurinn.is',
    siteName: 'Bekkurinn',
    locale: 'is_IS',
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bekkurinn',
    description: 'Bylting fyrir bekkjarfulltrúa á Íslandi.',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={inter.variable}>
      <head>
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Bekkurinn",
              "url": "https://www.bekkurinn.is",
              "description": "Skipulagt kerfi fyrir bekkjarfulltrúa á Íslandi. Bekkjarlisti, afmælisáminningar, viðburðir og tilkynningar á einum stað.",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "ISK"
              },
              "author": {
                "@type": "Organization",
                "name": "Bekkurinn",
                "url": "https://www.bekkurinn.is"
              },
              "inLanguage": ["is", "en", "pl", "lt", "es"],
              "audience": {
                "@type": "EducationalAudience",
                "educationalRole": "parent"
              }
            })
          }}
        />
      </head>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
        {/* Vercel Web Analytics: engar vefkökur, aðeins í production og aðeins hjá óinnskráðum */}
        {process.env.VERCEL_ENV === 'production' && <PublicAnalytics />}
      </body>
    </html>
  );
}



