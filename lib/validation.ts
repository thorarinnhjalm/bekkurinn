import { z } from 'zod';

/**
 * Validation Schemas for Bekkurinn
 * 
 * Centralized input validation using Zod.
 * Provides type-safe validation with Icelandic error messages.
 */

// ========================================
// ONBOARDING
// ========================================

export const OnboardingSchema = z.object({
    schoolName: z.string()
        .min(3, 'Skólanafn verður að vera a.m.k. 3 stafir')
        .max(100, 'Skólanafn of langt'),
    grade: z.number()
        .int('Bekkur verður að vera heiltala')
        .min(1, 'Bekkur verður að vera á bilinu 1-10')
        .max(10, 'Bekkur verður að vera á bilinu 1-10'),
    section: z.string()
        .max(50, 'Deild of löng')
        .optional(),
    isSplit: z.boolean(),
});

export type OnboardingInput = z.infer<typeof OnboardingSchema>;

// ========================================
// JOIN CODE
// ========================================

export const JoinCodeSchema = z.string()
    .min(4, 'Boðskóði of stuttur')
    .max(30, 'Boðskóði of langur')
    .regex(/^[A-Z0-9-]+$/, 'Boðskóði má bara innihalda stóra stafi, tölur og bandstrik')
    .transform(val => val.toUpperCase().trim());

// ========================================
// STUDENT
// ========================================

export const StudentSchema = z.object({
    name: z.string()
        .min(2, 'Nafn of stutt')
        .max(100, 'Nafn of langt'),
    birthDate: z.coerce.date(),
    dietaryNeeds: z.array(z.string()).optional(),
    allergies: z.string().max(500, 'Of langur texti').optional(),
    classId: z.string().min(1, 'Bekkur vantar'),
});

export type StudentInput = z.infer<typeof StudentSchema>;

// ========================================
// ANNOUNCEMENT
// ========================================

export const AnnouncementSchema = z.object({
    title: z.string()
        .min(3, 'Titill of stuttur')
        .max(200, 'Titill of langur'),
    body: z.string()
        .min(10, 'Texti of stuttur')
        .max(5000, 'Texti of langur'),
    classId: z.string().min(1, 'Bekkur vantar'),
    pinned: z.boolean().optional(),
});

export type AnnouncementInput = z.infer<typeof AnnouncementSchema>;

// ========================================
// TASK / EVENT
// ========================================

export const TaskSchema = z.object({
    title: z.string()
        .min(3, 'Titill of stuttur')
        .max(200, 'Titill of langur'),
    description: z.string()
        .max(2000, 'Lýsing of löng')
        .optional(),
    date: z.coerce.date(),
    slotsTotal: z.number()
        .int('Fjöldi verður að vera heiltala')
        .min(0, 'Fjöldi getur ekki verið neikvæður')
        .max(50, 'Fjöldi of hár'),
    classId: z.string().min(1, 'Bekkur vantar'),
    type: z.enum(['task', 'school_event']).optional(),
});

export type TaskInput = z.infer<typeof TaskSchema>;

// ========================================
// SETTINGS
// ========================================

export const SettingsSchema = z.object({
    schoolName: z.string()
        .min(3, 'Skólanafn of stutt')
        .max(100, 'Skólanafn of langt'),
    grade: z.number()
        .int('Bekkur verður að vera heiltala')
        .min(1, 'Bekkur verður að vera á bilinu 1-10')
        .max(10, 'Bekkur verður að vera á bilinu 1-10'),
    section: z.string()
        .max(50, 'Deild of löng')
        .optional(),
    calendarUrl: z.string()
        .url('Ógild vefslóð')
        .optional()
        .or(z.literal('')), // Allow empty string
    joinCode: z.string()
        .min(4, 'Boðskóði of stuttur')
        .max(30, 'Boðskóði of langur')
        .regex(/^[A-Z0-9-]+$/, 'Boðskóði má bara innihalda stóra stafi, tölur og bandstrik')
        .optional(),
});

export type SettingsInput = z.infer<typeof SettingsSchema>;

// ========================================
// USER UPDATE
// ========================================

export const UserUpdateSchema = z.object({
    displayName: z.string()
        .min(2, 'Nafn of stutt')
        .max(100, 'Nafn of langt')
        .optional(),
    phone: z.string()
        .regex(/^[0-9\s\-\+\(\)]+$/, 'Ógilt símanúmer')
        .optional()
        .or(z.literal('')),
    isPhoneVisible: z.boolean().optional(),
    language: z.enum(['is', 'en']).optional(),
});

export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Validates data against schema and returns formatted errors
 */
export function validateInput<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors = result.error.issues.map((err) =>
        err.path.length > 0
            ? `${err.path.join('.')}: ${err.message}`
            : err.message
    );

    return { success: false, errors };
}
