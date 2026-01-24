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
        .min(3, 'School name must be at least 3 characters')
        .max(100, 'School name too long'),
    grade: z.number()
        .int('Grade must be a whole number')
        .min(1, 'Grade must be between 1-10')
        .max(10, 'Grade must be between 1-10'),
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
    .min(4, 'Join code too short')
    .max(30, 'Join code too long')
    .regex(/^[A-Z0-9-]+$/, 'Join code can only contain uppercase letters, numbers and hyphens')
    .transform(val => val.toUpperCase().trim());

// ========================================
// STUDENT
// ========================================

export const StudentSchema = z.object({
    name: z.string()
        .min(2, 'Name too short')
        .max(100, 'Name too long'),
    birthDate: z.coerce.date(),
    dietaryNeeds: z.array(z.string()).optional(),
    allergies: z.string().max(500, 'Text too long').optional(),
    classId: z.string().min(1, 'Class required'),
});

export type StudentInput = z.infer<typeof StudentSchema>;

// ========================================
// ANNOUNCEMENT
// ========================================

export const AnnouncementSchema = z.object({
    title: z.string()
        .min(3, 'Title too short')
        .max(200, 'Title too long'),
    body: z.string()
        .min(10, 'Text too short')
        .max(5000, 'Text too long'),
    classId: z.string().min(1, 'Class required'),
    pinned: z.boolean().optional(),
});

export type AnnouncementInput = z.infer<typeof AnnouncementSchema>;

// ========================================
// TASK / EVENT
// ========================================

export const TaskSchema = z.object({
    title: z.string()
        .min(3, 'Title too short')
        .max(200, 'Title too long'),
    description: z.string()
        .max(2000, 'Description too long')
        .optional(),
    date: z.coerce.date(),
    slotsTotal: z.number()
        .int('Count must be a whole number')
        .min(0, 'Count cannot be negative')
        .max(50, 'Count too high'),
    classId: z.string().min(1, 'Class required'),
    type: z.enum(['task', 'school_event']).optional(),
});

export type TaskInput = z.infer<typeof TaskSchema>;

// ========================================
// SETTINGS
// ========================================

export const SettingsSchema = z.object({
    schoolName: z.string()
        .min(3, 'School name too short')
        .max(100, 'School name too long'),
    grade: z.number()
        .int('Grade must be a whole number')
        .min(1, 'Grade must be between 1-10')
        .max(10, 'Grade must be between 1-10'),
    section: z.string()
        .max(50, 'Section name too long')
        .optional(),
    calendarUrl: z.string()
        .url('Invalid URL')
        .optional()
        .or(z.literal('')), // Allow empty string
    joinCode: z.string()
        .min(4, 'Join code too short')
        .max(30, 'Join code too long')
        .regex(/^[A-Z0-9-]+$/, 'Join code can only contain uppercase letters, numbers and hyphens')
        .optional(),
});

export type SettingsInput = z.infer<typeof SettingsSchema>;

// ========================================
// USER UPDATE
// ========================================

export const UserUpdateSchema = z.object({
    displayName: z.string()
        .min(2, 'Name too short')
        .max(100, 'Name too long')
        .optional(),
    phone: z.string()
        .regex(/^[0-9\s\-\+\(\)]+$/, 'Invalid phone number')
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
