import { describe, it, expect } from 'vitest';
import { normalizeJoinCode, JOIN_CODE_PATTERN } from '@/lib/joinCode';

describe('normalizeJoinCode', () => {
    it('leaves a canonical code untouched', () => {
        expect(normalizeJoinCode('SALA-4-B-1234')).toBe('SALA-4-B-1234');
        expect(normalizeJoinCode('SALA-4-B-1234-ADMIN')).toBe('SALA-4-B-1234-ADMIN');
    });

    it('trims surrounding whitespace and newlines from pasted codes', () => {
        expect(normalizeJoinCode('  SALA-4-B-1234 \n')).toBe('SALA-4-B-1234');
        expect(normalizeJoinCode('SALA-4-B-1234 ')).toBe('SALA-4-B-1234');
    });

    it('uppercases, including Icelandic letters', () => {
        expect(normalizeJoinCode('álfh-3-4821')).toBe('ÁLFH-3-4821');
        expect(normalizeJoinCode('sala-4-b-1234-admin')).toBe('SALA-4-B-1234-ADMIN');
    });

    it('composes decomposed Icelandic characters (NFD → NFC)', () => {
        expect(normalizeJoinCode('ÁLFH-3-4821')).toBe('ÁLFH-3-4821');
    });

    it('replaces typographic dashes with hyphens', () => {
        expect(normalizeJoinCode('SALA–4–B–1234')).toBe('SALA-4-B-1234'); // en dashes
        expect(normalizeJoinCode('SALA—4—B—1234')).toBe('SALA-4-B-1234'); // em dashes
    });

    it('drops quotes, inner spaces, punctuation and zero-width characters', () => {
        expect(normalizeJoinCode('„SALA-4-B-1234“')).toBe('SALA-4-B-1234');
        expect(normalizeJoinCode('SALA - 4 - B - 1234.')).toBe('SALA-4-B-1234');
        expect(normalizeJoinCode('SALA​-4-1234')).toBe('SALA-4-1234');
    });

    it('collapses doubled hyphens and strips leading/trailing ones', () => {
        expect(normalizeJoinCode('--SALA-4--1234--')).toBe('SALA-4-1234');
    });

    it('returns an empty string for empty input', () => {
        expect(normalizeJoinCode('')).toBe('');
        expect(normalizeJoinCode('   ')).toBe('');
        expect(normalizeJoinCode(null)).toBe('');
        expect(normalizeJoinCode(undefined)).toBe('');
    });

    it('is idempotent', () => {
        const once = normalizeJoinCode(' kópa–2–a–9911 ');
        expect(normalizeJoinCode(once)).toBe(once);
        expect(once).toBe('KÓPA-2-A-9911');
    });

    it('produces codes that satisfy JOIN_CODE_PATTERN', () => {
        for (const raw of ['sala-4-b-1234', ' ÁLFH-3-4821 ', 'HÖRÐ–1–5555']) {
            expect(JOIN_CODE_PATTERN.test(normalizeJoinCode(raw))).toBe(true);
        }
        expect(JOIN_CODE_PATTERN.test('SALA 4')).toBe(false);
    });
});
