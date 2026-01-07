export const locales = ['en', 'is', 'pl', 'es', 'lt'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';
