/**
 * Gamla bekkjarforritið er lokað (nóvember 2026).
 *
 * Allar leiðir inn í forritið vísa á forsíðuna og öll API svara 410.
 * Kynningarsíðurnar eru ekki á þessum lista og haldast óbreyttar.
 * Kóði forritsins stendur óhreyfður þar til nýja kynningarsíðan tekur við.
 */
import { locales, defaultLocale } from '@/i18n-config';

/** Fyrsti slóðarhluti (á eftir tungumáli) sem tilheyrir lokaða forritinu. */
export const CLOSED_APP_SEGMENTS = [
    'login',
    'onboarding',
    'admin',
    'dashboard',
    'directory',
    'calendar',
    'patrol',
    'announcements',
    'agreement',
    'lost-found',
    'settings',
    'user',
] as const;

function decodeSegment(segment: string): string {
    try {
        return decodeURIComponent(segment);
    } catch {
        return segment;
    }
}

/**
 * Skilar slóð forsíðunnar sem á að vísa á ef `pathname` er inni í lokaða
 * forritinu, annars `null`.
 */
export function closedPageRedirect(pathname: string): string | null {
    const parts = pathname.split('/').filter(Boolean).map(decodeSegment);
    if (parts.length === 0) return null;

    const hasLocale = (locales as readonly string[]).includes(parts[0]);
    const segment = (hasLocale ? parts[1] : parts[0])?.toLowerCase();
    if (!segment) return null;
    if (!(CLOSED_APP_SEGMENTS as readonly string[]).includes(segment)) return null;

    return `/${hasLocale ? parts[0] : defaultLocale}`;
}

/** Öll API gamla forritsins eru lokuð. */
export function isClosedApi(pathname: string): boolean {
    const lower = decodeSegment(pathname).toLowerCase();
    return lower === '/api' || lower.startsWith('/api/');
}
