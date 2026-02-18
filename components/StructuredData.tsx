import Head from 'next/head';

interface Props {
    locale: string;
}

export default function StructuredData({ locale }: Props) {
    const baseUrl = 'https://www.bekkurinn.is';

    // SoftwareApplication Schema
    const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Bekkurinn",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "ISK"
        },
        "description": locale === 'is'
            ? "Fullkomið kerfi fyrir bekkjarfulltrúa og foreldra. Haltu utan um skólarölt, bekkjarsáttmála, viðburði og tengiliði á einum stað. Einfalt, öruggt og frítt."
            : "Simple, secure, and convenient system for class representatives and parents. Patrol, events, and contacts in one place.",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "120"
        }
    };

    // FAQ Schema (Sample questions matching the landing page)
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": locale === 'is' ? "Er þetta virkilega frítt?" : "Is it really free?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": locale === 'is'
                        ? "Já, algerlega frítt. Enginn falinn kostnaður, engin binding."
                        : "Yes, completely free. No hidden costs, no commitment."
                }
            },
            {
                "@type": "Question",
                "name": locale === 'is' ? "Hvernig er öryggið í kerfinu?" : "How secure is it?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": locale === 'is'
                        ? "Gagnaöryggi er forgangsmál. Við notum sömu dulkóðun og netbankar (256-bit encryption)."
                        : "Data security is a priority. We use bank-grade encryption (256-bit)."
                }
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </>
    );
}
