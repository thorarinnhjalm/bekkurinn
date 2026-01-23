import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hafðu samband | Bekkurinn',
    description: 'Ertu með spurningu, ábendingu eða tillögu? Hafðu samband við Bekkurinn teymið.',
    openGraph: {
        title: 'Hafðu samband við Bekkurinn',
        description: 'Ertu með spurningu, ábendingu eða tillögu? Við hlökkum til að heyra frá þér.',
        type: 'website',
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
