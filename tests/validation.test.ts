import { describe, it, expect } from 'vitest';
import {
    OnboardingSchema,
    JoinCodeSchema,
    StudentSchema,
    AnnouncementSchema,
    TaskSchema,
    SettingsSchema,
    UserUpdateSchema,
    validateInput,
} from '../lib/validation';

describe('Validation Schemas', () => {
    // ========================================
    // OnboardingSchema
    // ========================================
    describe('OnboardingSchema', () => {
        it('validates correct onboarding data', () => {
            const validData = {
                schoolName: 'Kópavogsskóli',
                grade: 4,
                section: 'A',
                isSplit: true,
            };
            const result = OnboardingSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('rejects school name that is too short', () => {
            const invalidData = {
                schoolName: 'AB',
                grade: 4,
                isSplit: false,
            };
            const result = OnboardingSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('rejects grade outside valid range (1-10)', () => {
            const invalidData = {
                schoolName: 'Kópavogsskóli',
                grade: 11,
                isSplit: false,
            };
            const result = OnboardingSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('allows missing section when isSplit is false', () => {
            const validData = {
                schoolName: 'Kópavogsskóli',
                grade: 4,
                isSplit: false,
            };
            const result = OnboardingSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });

    // ========================================
    // JoinCodeSchema
    // ========================================
    describe('JoinCodeSchema', () => {
        it('validates correct join code', () => {
            const result = JoinCodeSchema.safeParse('KOPA-4A-1234');
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe('KOPA-4A-1234');
            }
        });

        it('rejects lowercase letters', () => {
            const result = JoinCodeSchema.safeParse('kopa-4a');
            expect(result.success).toBe(false);
        });

        it('rejects trailing whitespace', () => {
            const result = JoinCodeSchema.safeParse('KOPA-4A  ');
            expect(result.success).toBe(false);
        });

        it('rejects code with special characters', () => {
            const result = JoinCodeSchema.safeParse('KOPA@4A');
            expect(result.success).toBe(false);
        });

        it('rejects code that is too short', () => {
            const result = JoinCodeSchema.safeParse('ABC');
            expect(result.success).toBe(false);
        });
    });

    // ========================================
    // StudentSchema
    // ========================================
    describe('StudentSchema', () => {
        it('validates correct student data', () => {
            const validData = {
                name: 'Jón Jónsson',
                birthDate: '2018-05-15',
                classId: 'class123',
                dietaryNeeds: ['gluten', 'dairy'],
            };
            const result = StudentSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('rejects name that is too short', () => {
            const invalidData = {
                name: 'J',
                birthDate: '2018-05-15',
                classId: 'class123',
            };
            const result = StudentSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('coerces date string to Date object', () => {
            const validData = {
                name: 'Jón Jónsson',
                birthDate: '2018-05-15',
                classId: 'class123',
            };
            const result = StudentSchema.safeParse(validData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.birthDate instanceof Date).toBe(true);
            }
        });
    });

    // ========================================
    // AnnouncementSchema
    // ========================================
    describe('AnnouncementSchema', () => {
        it('validates correct announcement data', () => {
            const validData = {
                title: 'Mikilvæg tilkynning',
                body: 'Þetta er mikilvæg tilkynning til allra foreldra um næsta viðburð.',
                classId: 'class123',
                pinned: true,
            };
            const result = AnnouncementSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('rejects title that is too short', () => {
            const invalidData = {
                title: 'Hi',
                body: 'Þetta er mikilvæg tilkynning til allra foreldra um næsta viðburð.',
                classId: 'class123',
            };
            const result = AnnouncementSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('rejects body that is too short', () => {
            const invalidData = {
                title: 'Tilkynning',
                body: 'Stutt',
                classId: 'class123',
            };
            const result = AnnouncementSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    // ========================================
    // TaskSchema
    // ========================================
    describe('TaskSchema', () => {
        it('validates correct task data', () => {
            const validData = {
                title: 'Foreldrarölt',
                description: 'Rölt við skólann',
                date: '2026-02-15',
                slotsTotal: 4,
                classId: 'class123',
            };
            const result = TaskSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('rejects negative slot count', () => {
            const invalidData = {
                title: 'Foreldrarölt',
                date: '2026-02-15',
                slotsTotal: -1,
                classId: 'class123',
            };
            const result = TaskSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('rejects slot count that is too high', () => {
            const invalidData = {
                title: 'Foreldrarölt',
                date: '2026-02-15',
                slotsTotal: 100,
                classId: 'class123',
            };
            const result = TaskSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    // ========================================
    // UserUpdateSchema
    // ========================================
    describe('UserUpdateSchema', () => {
        it('validates correct user update data', () => {
            const validData = {
                displayName: 'Jón Jónsson',
                phone: '+354 555 1234',
                isPhoneVisible: true,
                language: 'is' as const,
            };
            const result = UserUpdateSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('allows empty phone number', () => {
            const validData = {
                displayName: 'Jón Jónsson',
                phone: '',
            };
            const result = UserUpdateSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('rejects invalid phone number format', () => {
            const invalidData = {
                phone: 'not-a-phone',
            };
            const result = UserUpdateSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('validates phone with international format', () => {
            const validData = {
                phone: '+354 (555) 1234',
            };
            const result = UserUpdateSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });

    // ========================================
    // validateInput helper
    // ========================================
    describe('validateInput helper', () => {
        it('returns success with data for valid input', () => {
            const result = validateInput(JoinCodeSchema, 'KOPA-4A');
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe('KOPA-4A');
            }
        });

        it('returns errors array for invalid input', () => {
            const result = validateInput(JoinCodeSchema, 'a');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(Array.isArray(result.errors)).toBe(true);
                expect(result.errors.length).toBeGreaterThan(0);
            }
        });

        it('formats nested errors with path', () => {
            const result = validateInput(OnboardingSchema, {
                schoolName: 'A', // too short
                grade: 'not a number',
                isSplit: false,
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors.some(e => e.includes('schoolName'))).toBe(true);
            }
        });
    });
});
