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
  title: "Bekkurinn - Kerfi fyrir bekkjarfulltrúa",
  description: "Skipulagt kerfi fyrir bekkjarfulltrúa á Íslandi. Róleg, einföld lausn til að skipuleggja foreldrafélag bekkjarins.",
  keywords: ["bekkjarfulltrúi", "foreldrafélag", "skóli", "Iceland", "class representative"],
  authors: [{ name: "Bekkurinn" }],
  openGraph: {
    title: "Bekkurinn",
    description: "Skipulagt kerfi fyrir bekkjarfulltrúa",
    type: "website",
  },
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



