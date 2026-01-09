import { Timestamp } from 'firebase/firestore';

/**
 * Bekkurinn Data Types
 * Based on the Master Architecture Prompt
 */

// ========================================
// USER & AUTHENTICATION
// ========================================

export type UserLanguage = 'is' | 'en' | 'pl';

export interface User {
    uid: string;
    displayName: string;
    email: string;
    phone: string; // Mandatory
    address?: string; // Optional, for map linking
    isPhoneVisible: boolean; // Privacy toggle
    language: UserLanguage;
    photoURL?: string;
    createdAt: Timestamp;
}

// ========================================
// CLASS
// ========================================

export interface Class {
    id: string;
    joinCode: string; // Unique, e.g., "SALA-4B"
    parentTeamCode?: string; // Admin-only invite code
    name: string; // e.g., "Salaskóli 4. Bekkur"
    schoolName: string;
    grade: number;
    section?: string;
    calendarUrl?: string; // ICS URL for school calendar

    admins: string[]; // Array of UIDs
    confidentialityAgreedAt: Timestamp; // Legal requirement
    pactText?: string; // Social contract HTML
    createdAt: Timestamp;
}

// ========================================
// STUDENT
// ========================================

export type DietaryNeed = 'peanut' | 'gluten' | 'pork' | 'vegan' | 'dairy';
export type PhotoPermission = 'allow' | 'deny';

export interface Student {
    id: string;
    classId: string;
    name: string;
    birthDate: Timestamp;
    dietaryNeeds: DietaryNeed[];
    photoPermission: PhotoPermission;
    photoUrl?: string; // URL to storage
    createdAt: Timestamp;
}

// ========================================
// PARENT LINK (Junction Table)
// ========================================

export type ParentLinkStatus = 'pending' | 'approved';

export interface ParentLink {
    id: string;
    userId: string;
    studentId: string;
    classId: string;
    status: ParentLinkStatus;
    createdAt: Timestamp;
    approvedAt?: Timestamp;
    approvedBy?: string; // Admin UID
}

// ========================================
// TASK (Polymorphic)
// ========================================

export type TaskType = 'rolt' | 'event' | 'gift_collection' | 'school_event';

export interface TaskVolunteer {
    userId: string;
    name: string;
    timestamp: Timestamp;
}

export interface Task {
    id: string;
    classId: string;
    type: TaskType;
    title: string;
    description?: string;
    date: Timestamp;
    slotsTotal: number;
    slotsFilled: number;
    volunteers: TaskVolunteer[];
    createdAt: Timestamp;
    createdBy: string; // Admin UID
}

// ========================================
// ANNOUNCEMENT
// ========================================

export interface Announcement {
    id: string;
    classId: string;
    title: string;
    content: string;
    pinned: boolean;
    createdAt: Timestamp;
    createdBy: string; // Admin UID
    author: string; // Display name
}

// ========================================
// INPUT TYPES (for creating documents)
// ========================================

export type CreateUserInput = Omit<User, 'uid' | 'createdAt'> & {
    uid: string;
};

export type CreateClassInput = Omit<Class, 'id' | 'createdAt'>;

export type CreateStudentInput = Omit<Student, 'id' | 'createdAt'>;

export type CreateParentLinkInput = Omit<ParentLink, 'id' | 'createdAt' | 'approvedAt' | 'approvedBy'>;

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'slotsFilled' | 'volunteers'>;

export type CreateAnnouncementInput = Omit<Announcement, 'id' | 'createdAt'>;

// ========================================
// NOTIFICATIONS
// ========================================

export type NotificationType = 'system' | 'reminder' | 'announcement';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string; // Deep link to content
    read: boolean;
    createdAt: Timestamp;
}
