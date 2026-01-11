import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bekkurinn.vercel.app'),
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
    url: 'https://bekkurinn.vercel.app',
    siteName: 'Bekkurinn',
    locale: 'is_IS',
    type: "website",
    images: [
      {
        url: '/dashboard-mockup.png',
        width: 1200,
        height: 630,
        alt: 'Bekkurinn mælaborð',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bekkurinn',
    description: 'Bylting fyrir bekkjarfulltrúa á Íslandi.',
    images: ['/dashboard-mockup.png'],
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
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}



