import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    setDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    DocumentData,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { logger } from '@/lib/logger';
import type {
    Class,
    CreateClassInput,
    Student,
    CreateStudentInput,
    ParentLink,
    CreateParentLinkInput,
    Task,
    CreateTaskInput,
    Announcement,
    CreateAnnouncementInput,
    User,
    CreateUserInput,
    School,
    PickupOffer,
    CreatePickupOfferInput,
} from '@/types';

/**
 * Firestore Services for Bekkurinn
 * 
 * All CRUD operations for the app's data layer.
 * Uses aggressive caching via React Query.
 */

// ========================================
// USERS
// ========================================

export async function createUser(data: CreateUserInput): Promise<void> {
    try {
        await setDoc(doc(db, 'users', data.uid), {
            ...data,
            createdAt: serverTimestamp(),
        }, { merge: true });
    } catch (error) {
        logger.error('Failed to create user', error);
        throw new Error('Gat ekki búið til notanda');
    }
}

export async function getUser(uid: string): Promise<User | null> {
    try {
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (!docSnap.exists()) return null;
        return { ...docSnap.data(), uid: docSnap.id } as User;
    } catch (error) {
        logger.error('Failed to get user', error);
        return null;
    }
}

export async function updateUser(uid: string, data: Partial<User>): Promise<void> {
    await updateDoc(doc(db, 'users', uid), data);
}

export async function searchUsersByEmail(email: string): Promise<User[]> {
    const q = query(
        collection(db, 'users'),
        where('email', '>=', email),
        where('email', '<=', email + '\uf8ff'),
        limit(5)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
}

/**
 * Add a student to user's starred students list
 */
export async function addStarredStudent(uid: string, studentId: string): Promise<void> {
    try {
        const user = await getUser(uid);
        const starredStudents = user?.starredStudents || [];

        // Only add if not already starred
        if (!starredStudents.includes(studentId)) {
            starredStudents.push(studentId);
            await updateDoc(doc(db, 'users', uid), { starredStudents });
        }
    } catch (error) {
        logger.error('Failed to add starred student', error);
        throw new Error('Gat ekki viðbætt við uppáhald');
    }
}

/**
 * Remove a student from user's starred students list
 */
export async function removeStarredStudent(uid: string, studentId: string): Promise<void> {
    try {
        const user = await getUser(uid);
        const starredStudents = user?.starredStudents || [];

        const filtered = starredStudents.filter(id => id !== studentId);
        await updateDoc(doc(db, 'users', uid), { starredStudents: filtered });
    } catch (error) {
        logger.error('Failed to remove starred student', error);
        throw new Error('Gat ekki fjarlægt úr uppáhaldi');
    }
}

/**
 * Get user's starred students
 */
export async function getStarredStudents(uid: string): Promise<string[]> {
    const user = await getUser(uid);
    return user?.starredStudents || [];
}


// ========================================
// SCHOOLS
// ========================================

export async function getSchool(schoolId: string): Promise<School | null> {
    const docSnap = await getDoc(doc(db, 'schools', schoolId));
    if (!docSnap.exists()) return null;
    return { ...docSnap.data(), id: docSnap.id } as School;
}

export async function createSchool(schoolId: string, name: string): Promise<void> {
    await setDoc(doc(db, 'schools', schoolId), {
        name,
        admins: []
    });
}

export async function updateSchoolAdmins(schoolId: string, admins: string[]): Promise<void> {
    await updateDoc(doc(db, 'schools', schoolId), { admins });
}

export async function getAllSchools(): Promise<School[]> {
    const q = query(collection(db, 'schools'), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as School));
}

// ========================================
// CLASSES
// ========================================

export async function createClass(data: CreateClassInput): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'classes'), {
            ...data,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        logger.error('Failed to create class', error);
        throw new Error('Gat ekki búið til bekk');
    }
}

export async function getClass(classId: string): Promise<Class | null> {
    const docSnap = await getDoc(doc(db, 'classes', classId));
    if (!docSnap.exists()) return null;
    return { ...docSnap.data(), id: docSnap.id } as Class;
}

export async function getClassByJoinCode(joinCode: string): Promise<Class | null> {
    const q = query(collection(db, 'classes'), where('joinCode', '==', joinCode.toUpperCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as Class;
}

export async function updateClass(classId: string, data: Partial<Class>): Promise<void> {
    await updateDoc(doc(db, 'classes', classId), data);
}

// ========================================
// STUDENTS
// ========================================

export async function createStudent(data: CreateStudentInput): Promise<string> {
    const docRef = await addDoc(collection(db, 'students'), {
        ...data,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function getStudent(studentId: string): Promise<Student | null> {
    const docSnap = await getDoc(doc(db, 'students', studentId));
    if (!docSnap.exists()) return null;
    return { ...docSnap.data(), id: docSnap.id } as Student;
}

export async function getStudentsByClass(classId: string): Promise<Student[]> {
    const q = query(
        collection(db, 'students'),
        where('classId', '==', classId),
        orderBy('name')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Student));
}

export async function updateStudent(studentId: string, data: Partial<Student>): Promise<void> {
    await updateDoc(doc(db, 'students', studentId), data);
}

export async function deleteStudent(studentId: string): Promise<void> {
    await deleteDoc(doc(db, 'students', studentId));
}

// ========================================
// PARENT LINKS
// ========================================

export async function createParentLink(data: CreateParentLinkInput): Promise<string> {
    const linkId = `${data.userId}_${data.classId}`;
    await setDoc(doc(db, 'parentLinks', linkId), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
    });
    return linkId;
}

export async function getParentLinksByUser(userId: string): Promise<ParentLink[]> {
    const q = query(
        collection(db, 'parentLinks'),
        where('userId', '==', userId),
        where('status', '==', 'approved')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ParentLink));
}

export async function getParentLinksByStudent(studentId: string): Promise<ParentLink[]> {
    const q = query(
        collection(db, 'parentLinks'),
        where('studentId', '==', studentId),
        where('status', '==', 'approved')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ParentLink));
}

export async function getParentLinkByUserAndClass(userId: string, classId: string): Promise<ParentLink | null> {
    const q = query(
        collection(db, 'parentLinks'),
        where('userId', '==', userId),
        where('classId', '==', classId),
        limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as ParentLink;
}

export async function getPendingParentLinks(classId: string): Promise<ParentLink[]> {
    const q = query(
        collection(db, 'parentLinks'),
        where('classId', '==', classId),
        where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ParentLink));
}

export async function approveParentLink(linkId: string, adminUid: string): Promise<void> {
    await updateDoc(doc(db, 'parentLinks', linkId), {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: adminUid,
    });
}

export async function deleteParentLink(linkId: string): Promise<void> {
    await deleteDoc(doc(db, 'parentLinks', linkId));
}

// ========================================
// TASKS
// ========================================

export async function createTask(data: CreateTaskInput): Promise<string> {
    const docRef = await addDoc(collection(db, 'tasks'), {
        ...data,
        slotsFilled: 0,
        volunteers: [],
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function getTask(taskId: string): Promise<Task | null> {
    const docSnap = await getDoc(doc(db, 'tasks', taskId));
    if (!docSnap.exists()) return null;
    return { ...docSnap.data(), id: docSnap.id } as Task;
}

export async function getTasksByClass(classId: string): Promise<Task[]> {
    const q = query(
        collection(db, 'tasks'),
        where('classId', '==', classId)
        // Removed orderBy to avoid index requirement - we'll sort client-side
    );
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Task));

    // Sort by date in memory (descending - newest first)
    return tasks.sort((a, b) => {
        const aTime = a.date?.seconds || 0;
        const bTime = b.date?.seconds || 0;
        return bTime - aTime;
    });
}


export async function claimTaskSlot(taskId: string, userId: string, userName: string): Promise<void> {
    const task = await getTask(taskId);
    if (!task) throw new Error('Task not found');
    if (task.slotsFilled >= task.slotsTotal) throw new Error('Task is full');

    const volunteers = [
        ...task.volunteers,
        { userId, name: userName, timestamp: Timestamp.now() },
    ];

    await updateDoc(doc(db, 'tasks', taskId), {
        volunteers,
        slotsFilled: volunteers.length,
    });
}

export async function unclaimTaskSlot(taskId: string, userId: string): Promise<void> {
    const task = await getTask(taskId);
    if (!task) throw new Error('Task not found');

    const volunteers = task.volunteers.filter(v => v.userId !== userId);

    await updateDoc(doc(db, 'tasks', taskId), {
        volunteers,
        slotsFilled: volunteers.length,
    });
}

export async function updateTask(taskId: string, data: Partial<Task>): Promise<void> {
    await updateDoc(doc(db, 'tasks', taskId), data);
}

export async function deleteTask(taskId: string): Promise<void> {
    await deleteDoc(doc(db, 'tasks', taskId));
}

// ========================================
// ANNOUNCEMENTS
// ========================================

export async function createAnnouncement(data: CreateAnnouncementInput): Promise<string> {
    const docRef = await addDoc(collection(db, 'announcements'), {
        ...data,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function getAnnouncement(announcementId: string): Promise<Announcement | null> {
    const docSnap = await getDoc(doc(db, 'announcements', announcementId));
    if (!docSnap.exists()) return null;
    return { ...docSnap.data(), id: docSnap.id } as Announcement;
}

export async function getAnnouncementsByClass(classId: string): Promise<Announcement[]> {
    const q = query(
        collection(db, 'announcements'),
        where('classId', '==', classId),
        orderBy('createdAt', 'desc'),
        limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Announcement));
}

export async function getAnnouncementsBySchool(schoolId: string): Promise<Announcement[]> {
    const q = query(
        collection(db, 'announcements'),
        where('schoolId', '==', schoolId),
        where('scope', '==', 'school'),
        orderBy('createdAt', 'desc'),
        limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Announcement));
}

export async function toggleAnnouncementPin(announcementId: string, pinned: boolean): Promise<void> {
    await updateDoc(doc(db, 'announcements', announcementId), { pinned });
}

export async function updateAnnouncement(announcementId: string, data: Partial<Announcement>): Promise<void> {
    await updateDoc(doc(db, 'announcements', announcementId), data);
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
    await deleteDoc(doc(db, 'announcements', announcementId));
}

// ========================================
// SCHOOL EVENTS (Tasks variant)
// ========================================

export async function getTasksBySchool(schoolId: string): Promise<Task[]> {
    const q = query(
        collection(db, 'tasks'),
        where('schoolId', '==', schoolId),
        where('scope', '==', 'school')
    );
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Task));

    return tasks.sort((a, b) => {
        const aTime = a.date?.seconds || 0;
        const bTime = b.date?.seconds || 0;
        return bTime - aTime;
    });
}
// ========================================
// EMAIL & MEMBERSHIP HELPERS
// ========================================

export async function getClassMemberEmails(classId: string): Promise<string[]> {
    const q = query(
        collection(db, 'parentLinks'),
        where('classId', '==', classId),
        where('status', '==', 'approved')
    );
    const snapshot = await getDocs(q);
    const userIds = Array.from(new Set(snapshot.docs.map(doc => doc.data().userId)));

    if (userIds.length === 0) return [];

    const emails: string[] = [];
    // Firestore 'in' query supports max 10/30 depending on version, let's batch by 10
    for (let i = 0; i < userIds.length; i += 10) {
        const batch = userIds.slice(i, i + 10);
        const usersQ = query(collection(db, 'users'), where('uid', 'in', batch));
        const usersSnap = await getDocs(usersQ);
        usersSnap.forEach(doc => {
            const data = doc.data();
            if (data.email) emails.push(data.email);
        });
    }

    return Array.from(new Set(emails));
}

export async function getSchoolMemberEmails(schoolId: string): Promise<string[]> {
    // 1. Get all classes in school
    const q = query(collection(db, 'classes'), where('schoolId', '==', schoolId));
    const snapshot = await getDocs(q);
    const classIds = snapshot.docs.map(doc => doc.id);

    if (classIds.length === 0) return [];

    let allEmails: string[] = [];
    for (const classId of classIds) {
        const emails = await getClassMemberEmails(classId);
        allEmails = [...allEmails, ...emails];
    }

    return Array.from(new Set(allEmails));
}

// ========================================
// PICKUP OFFERS
// ========================================

/**
 * Create a new pickup offer
 */
export async function createPickupOffer(data: CreatePickupOfferInput): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'pickupOffers'), {
            ...data,
            acceptances: [],
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        logger.error('Failed to create pickup offer', error);
        throw new Error('Gat ekki búið til skutltilboð');
    }
}

/**
 * Get a single pickup offer by ID
 */
export async function getPickupOffer(offerId: string): Promise<PickupOffer | null> {
    try {
        const docSnap = await getDoc(doc(db, 'pickupOffers', offerId));
        if (!docSnap.exists()) return null;
        return { ...docSnap.data(), id: docSnap.id } as PickupOffer;
    } catch (error) {
        logger.error('Failed to get pickup offer', error);
        return null;
    }
}

/**
 * Get all active pickup offers for a class
 */
export async function getPickupOffersByClass(classId: string): Promise<PickupOffer[]> {
    const q = query(
        collection(db, 'pickupOffers'),
        where('classId', '==', classId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PickupOffer));
}

/**
 * Get pickup offers sent to a specific parent
 */
export async function getPickupOffersForParent(parentId: string, classId: string): Promise<PickupOffer[]> {
    const q = query(
        collection(db, 'pickupOffers'),
        where('classId', '==', classId),
        where('sentToParents', 'array-contains', parentId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PickupOffer));
}

/**
 * Get pickup offers created by a specific parent
 */
export async function getPickupOffersByParent(parentId: string, classId: string): Promise<PickupOffer[]> {
    const q = query(
        collection(db, 'pickupOffers'),
        where('classId', '==', classId),
        where('offeredBy', '==', parentId),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PickupOffer));
}

/**
 * Accept a pickup offer
 */
export async function acceptPickupOffer(
    offerId: string,
    parentId: string,
    parentName: string,
    studentId: string,
    studentName: string
): Promise<void> {
    try {
        const offer = await getPickupOffer(offerId);
        if (!offer) throw new Error('Offer not found');

        // Check if this parent/student already accepted
        const alreadyAccepted = offer.acceptances.some(
            a => a.parentId === parentId && a.studentId === studentId
        );
        if (alreadyAccepted) {
            throw new Error('You have already accepted this offer');
        }

        // Check if slots are available
        if (offer.acceptances.length >= offer.availableSlots) {
            throw new Error('No slots available');
        }

        const newAcceptance = {
            parentId,
            parentName,
            studentId,
            studentName,
            timestamp: Timestamp.now(),
        };

        const updatedAcceptances = [...offer.acceptances, newAcceptance];

        await updateDoc(doc(db, 'pickupOffers', offerId), {
            acceptances: updatedAcceptances,
        });
    } catch (error) {
        logger.error('Failed to accept pickup offer', error);
        throw error;
    }
}

/**
 * Cancel/close a pickup offer (by creator)
 */
export async function cancelPickupOffer(offerId: string): Promise<void> {
    try {
        await updateDoc(doc(db, 'pickupOffers', offerId), {
            isActive: false,
        });
    } catch (error) {
        logger.error('Failed to cancel pickup offer', error);
        throw new Error('Gat ekki hætt við tilboð');
    }
}

/**
 * Get parent UIDs of starred students' parents
 * Used to send pickup offers to starred friends only
 */
export async function getStarredFriendsParents(userId: string, classId: string): Promise<string[]> {
    try {
        // 1. Get user's starred students
        const user = await getUser(userId);
        const starredStudentIds = user?.starredStudents || [];

        if (starredStudentIds.length === 0) return [];

        // 2. Get parent links for those students in this class
        const parentLinksQuery = query(
            collection(db, 'parentLinks'),
            where('studentId', 'in', starredStudentIds),
            where('classId', '==', classId),
            where('status', '==', 'approved')
        );
        const parentLinksSnap = await getDocs(parentLinksQuery);

        // 3. Extract parent UIDs, excluding the current user
        const parentIds = parentLinksSnap.docs
            .map(doc => doc.data().userId as string)
            .filter(uid => uid !== userId);

        // 4. Deduplicate
        return [...new Set(parentIds)];
    } catch (error) {
        logger.error('Failed to get starred friends parents', error);
        return [];
    }
}

/**
 * Get all parent UIDs in a class
 * Used when sending pickup offer to everyone
 */
export async function getAllClassParents(classId: string): Promise<string[]> {
    try {
        const q = query(
            collection(db, 'parentLinks'),
            where('classId', '==', classId),
            where('status', '==', 'approved')
        );
        const snapshot = await getDocs(q);
        const parentIds = snapshot.docs.map(doc => doc.data().userId as string);
        return [...new Set(parentIds)]; // Deduplicate
    } catch (error) {
        logger.error('Failed to get all class parents', error);
        return [];
    }
}

// ========================================
// CLASS MIGRATION
// ========================================

/**
 * Migrate a standalone class to a school
 * Updates the class's schoolId field
 */
export async function migrateClassToSchool(classId: string, schoolId: string): Promise<void> {
    try {
        await updateDoc(doc(db, 'classes', classId), {
            schoolId: schoolId
        });
        logger.info(`Migrated class ${classId} to school ${schoolId}`);
    } catch (error) {
        logger.error('Failed to migrate class to school', error);
        throw new Error('Gat ekki flutt bekk í skóla');
    }
}
