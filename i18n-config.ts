export const locales = ['en', 'is', 'pl', 'es', 'lt', 'tl', 'uk', 'vi'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'is';
