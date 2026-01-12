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
