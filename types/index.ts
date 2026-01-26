import { Timestamp } from 'firebase/firestore';

/**
 * Bekkurinn Data Types
 * Based on the Master Architecture Prompt
 */

// ========================================
// USER & AUTHENTICATION
// ========================================

export type UserLanguage = 'is' | 'en' | 'pl';

// Lost & Found
export interface LostItem {
    id: string;
    classId: string;
    schoolId: string;
    scope: 'class' | 'school'; // 'school' = found items (admin), 'class' = lost requests (parents)
    type: 'lost' | 'found';
    title: string;
    description: string;
    imageUrl?: string;
    location?: string; // e.g. "Sports Hall"
    isClaimed: boolean;
    claimedBy?: string;
    createdAt: any; // Timestamp
    createdBy: string;
    author: string;
    authorImage?: string;
}

export interface User {
    uid: string;
    displayName: string;
    email: string;
    phone: string; // Mandatory
    address?: string; // Optional, for map linking
    isPhoneVisible: boolean; // Privacy toggle
    language: UserLanguage;
    photoURL?: string;
    starredStudents?: string[]; // Array of student IDs marked as friends

    // New: Notification Preferences
    notificationSettings?: NotificationSettings;

    createdAt: Timestamp;
}

export interface NotificationSettings {
    email: {
        announcements: boolean; // Critical announcements
        reminders: boolean; // Event reminders
        marketing: boolean; // "News from Bekkurinn"
    };
    push: {
        announcements: boolean;
        reminders: boolean;
    };
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
    schoolId?: string | null; // ID from SCHOOLS constant if verified
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
export type Gender = 'boy' | 'girl' | 'other';

export interface Student {
    id: string;
    classId: string;
    name: string;
    gender?: Gender;
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
// SCHOOL
// ========================================

export interface School {
    id: string;
    name: string;
    admins: string[]; // List of UIDs (Foreldrafélag members)
}

// ========================================
// TASK (Polymorphic)
// ========================================

export type TaskType = 'rolt' | 'event' | 'gift_collection' | 'school_event' | 'birthday';

export interface TaskVolunteer {
    userId: string;
    name: string;
    timestamp: Timestamp;
}

export interface Task {
    id: string;
    classId?: string; // Optional for school-wide events
    schoolId?: string;
    scope: 'class' | 'school';

    type: TaskType;
    title: string;
    description?: string;
    date: Timestamp;
    endDate?: Timestamp; // For multi-day events
    slotsTotal: number;
    slotsFilled: number;
    volunteers: TaskVolunteer[];
    isAllDay?: boolean;
    createdAt: Timestamp;
    createdBy: string; // Admin UID
    originalLanguage?: string; // Babelfish feature

    // Birthday Features
    invitees?: string[]; // Array of Student IDs
    isPrivate?: boolean; // If true, only visible to invitees
}

// ========================================
// ANNOUNCEMENT
// ========================================

export interface PollOption {
    id: string;
    text: string;
    votes: string[]; // Array of user IDs
}

export interface Announcement {
    id: string;
    classId: string | null;
    schoolId: string | null;
    scope: 'class' | 'school';
    title: string;
    content: string;
    pinned: boolean;
    isCritical?: boolean; // For "nuclear" emails
    originalLanguage?: string;
    pollOptions?: PollOption[]; // New: Poll Support
    allowMultipleVotes?: boolean; // New: Poll Configuration
    createdAt: any;
    createdBy: string;
    author: string;
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
// PICKUP OFFERS
// ========================================

export interface PickupOffer {
    id: string;
    classId: string;

    // Who's offering help
    offeredBy: string; // Parent UID
    offeredByName: string;
    offeredByStudentId: string; // Their child's ID

    // Offer details
    title: string; // "Skutl heim kl 14:00"
    description?: string; // Optional context
    date: Timestamp; // When they're picking up
    time: string; // "14:00"
    availableSlots: number; // How many extra kids can they take

    // Targeting
    sentToParents: string[]; // Array of parent UIDs (starred friends' parents)
    onlyStarredFriends: boolean; // If true, only sent to starred

    // Responses
    acceptances: {
        parentId: string;
        parentName: string;
        studentId: string;
        studentName: string;
        timestamp: Timestamp;
    }[];

    createdAt: Timestamp;
    isActive: boolean; // Can be closed by creator
}

export type CreatePickupOfferInput = Omit<PickupOffer, 'id' | 'createdAt' | 'acceptances'>;

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

// ========================================
// TESTIMONIALS
// ========================================

export type TestimonialStatus = 'pending' | 'approved' | 'rejected';

export interface Testimonial {
    id: string;
    userId: string;
    userName: string;
    userRole: string; // "Bekkjarfulltrúi", "Foreldri", etc.
    schoolName?: string;
    text: string;
    rating: number; // 1-5 stars
    status: TestimonialStatus;
    createdAt: Timestamp;
    approvedAt?: Timestamp;
    approvedBy?: string;
}

export type CreateTestimonialInput = Omit<Testimonial, 'id' | 'createdAt' | 'approvedAt' | 'approvedBy' | 'status'>;


// ========================================
// AGREEMENTS (Bekkjarsáttmáli)
// ========================================

export type AgreementStatus = 'draft' | 'voting' | 'published';

export interface AgreementOption {
    value: string | number;
    labelKey: string; // Translation key
}

export interface AgreementItem {
    id: string; // e.g., 'gift_amount'
    type: 'select' | 'radio' | 'boolean';
    questionKey: string;
    options: AgreementOption[];
    winningValue?: string | number; // Populated by admin or auto-calc
}

export interface AgreementSection {
    id: string; // e.g., 'birthdays'
    templateId: string;
    titleKey: string;
    descriptionKey: string;
    items: AgreementItem[];
}

export interface Agreement {
    id: string;
    classId: string;
    schoolId?: string;
    status: AgreementStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    votingDeadline?: Timestamp;
    sections: AgreementSection[];

    // Metadata
    createdBy: string;
    publishedAt?: Timestamp;
    ratifiedBy?: string; // Admin UID
}

export interface AgreementVote {
    id: string; // userId
    userId: string;
    userName: string;
    studentId?: string; // Optional: Link to child
    timestamp: Timestamp;
    answers: {
        [itemId: string]: string | number;
    };
}

export type CreateAgreementInput = Omit<Agreement, 'id' | 'createdAt' | 'updatedAt'>;
