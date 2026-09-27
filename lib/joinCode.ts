/**
 * Join-code normalization
 *
 * Class codes are generated in uppercase (e.g. "ÁLFH-3-B-4821"; the co-admin variant
 * appends "-ADMIN") and Firestore compares them byte for byte. Parents paste codes from
 * Facebook, SMS or email with stray whitespace, typographic dashes, lowercase letters,
 * surrounding quotes or decomposed Icelandic characters, all of which used to produce
 * "Enginn bekkur fannst". Every code must pass through `normalizeJoinCode` before it is
 * queried or stored.
 */

// Unicode property escapes need the `u` flag; built with RegExp so the ES2017 TS target
// does not reject the literal syntax.
const NON_CODE_CHARS = new RegExp('[^\\p{L}\\p{N}-]', 'gu');
const TYPOGRAPHIC_DASHES = /[‐-―−﹘﹣－]/g;

/** Canonical shape of a normalized code: letters (incl. Icelandic), digits and hyphens. */
export const JOIN_CODE_PATTERN = new RegExp('^[\\p{L}\\p{N}-]+$', 'u');

export function normalizeJoinCode(raw: string | null | undefined): string {
    if (!raw) return '';
    return raw
        .normalize('NFC')
        .toUpperCase()
        .replace(TYPOGRAPHIC_DASHES, '-')
        .replace(NON_CODE_CHARS, '')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '');
}
