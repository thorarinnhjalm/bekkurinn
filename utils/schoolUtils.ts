import { SCHOOLS } from '@/constants/schools';

/**
 * Check if a school is located in Kópavogur municipality
 * @param schoolId - The school ID to check
 * @returns true if the school is in Kópavogur, false otherwise
 */
export function isKopavogurSchool(schoolId: string | null | undefined): boolean {
    if (!schoolId) return false;
    return SCHOOLS.some(school => school.id === schoolId);
}
