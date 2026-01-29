'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getClass,
    getStudentsByClass,
    createStudent,
    updateStudent,
    deleteStudent,
    getParentLinksByStudent,
    getTasksByClass,
    createTask,
    updateTask,
    claimTaskSlot,
    unclaimTaskSlot,
    deleteTask,
    getAnnouncementsByClass,
    createAnnouncement,
    updateAnnouncement,
    toggleAnnouncementPin,
    deleteAnnouncement,
    getParentLinkByUserAndClass,
    getSchool,
    getAnnouncementsBySchool,
    getTasksBySchool,
    getParentLinksByUser
} from '@/services/firestore';
import {
    getAgreementByClass,
    createAgreement,
    updateAgreement,
    castVote,
    getAgreementVotes,
    getMyVote,
    deleteAgreement,
    signAgreement,
    getAgreementSignatures
} from '@/services/agreementService';
import type { CreateStudentInput, CreateTaskInput, CreateAnnouncementInput, CreateAgreementInput, AgreementVote } from '@/types';
import { Class, Student, Task, Announcement, ParentLink, LostItem, Agreement, ClassWithRole } from '@/types';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// ... existing code ...

// ==========================================
// AGREEMENT HOOKS
// ==========================================

export function useAgreement(classId: string | null) {
    return useQuery({
        queryKey: ['agreement', classId],
        queryFn: () => (classId ? getAgreementByClass(classId) : null),
        enabled: !!classId,
    });
}

export function useAgreementVotes(agreementId: string | undefined) {
    return useQuery({
        queryKey: ['agreementVotes', agreementId],
        queryFn: () => (agreementId ? getAgreementVotes(agreementId) : []),
        enabled: !!agreementId,
    });
}

export function useMyVote(agreementId: string | undefined, userId: string | undefined) {
    return useQuery({
        queryKey: ['myVote', agreementId, userId],
        queryFn: () => (agreementId && userId ? getMyVote(agreementId, userId) : null),
        enabled: !!agreementId && !!userId,
    });
}

export function useCreateAgreement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAgreementInput) => createAgreement(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['agreement', variables.classId] });
        },
    });
}

export function useUpdateAgreement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ agreementId, data }: { agreementId: string; data: Partial<Agreement> }) =>
            updateAgreement(agreementId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['agreement'] });
            // Also invalidate specific agreement cache if needed
            queryClient.invalidateQueries({ queryKey: ['agreementVotes', variables.agreementId] });
        },
    });
}

export function useCastVote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ agreementId, vote }: { agreementId: string; vote: Omit<AgreementVote, 'id' | 'timestamp'> }) =>
            castVote(agreementId, vote),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['agreementVotes', variables.agreementId] });
            queryClient.invalidateQueries({ queryKey: ['myVote', variables.agreementId] });
        },
    });
}

export function useDeleteAgreement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (agreementId: string) => deleteAgreement(agreementId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agreement'] });
        },
    });
}

export function useAgreementSignatures(agreementId: string | undefined) {
    return useQuery({
        queryKey: ['agreementSignatures', agreementId],
        queryFn: () => (agreementId ? getAgreementSignatures(agreementId) : []),
        enabled: !!agreementId,
    });
}

export function useSignAgreement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ agreementId, signature }: { agreementId: string; signature: { userId: string; userName: string } }) =>
            signAgreement(agreementId, signature),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['agreementSignatures', variables.agreementId] });
        },
    });
}

// ... other hooks ...

// ========================================
// USER / CONTEXT HOOKS
// ========================================

export function useUserClasses(userId: string | undefined, userEmail?: string | null) {
    return useQuery({
        queryKey: ['userClasses', userId, userEmail],
        queryFn: async () => {
            if (!userId) return [];

            const classesMap = new Map();

            // 1. Check if admin (PRIORITY - checked first)
            const adminQ = query(collection(db, 'classes'), where('admins', 'array-contains', userId));
            const adminSnap = await getDocs(adminQ);

            adminSnap.docs.forEach(doc => {
                const classData = { id: doc.id, ...doc.data(), role: 'admin' } as ClassWithRole;
                classesMap.set(doc.id, classData);
            });

            // 2. Check parentLinks (ONLY for classes where user is NOT admin)
            const parentQ = query(collection(db, 'parentLinks'), where('userId', '==', userId));
            const parentSnap = await getDocs(parentQ);

            // We need to fetch class details for each parent link
            // CRITICAL: Filter out classes where user is already admin
            const parentClassIds = parentSnap.docs
                .map(doc => doc.data().classId)
                .filter(id => !classesMap.has(id));

            // Batch fetch classes (max 10 per query due to Firestore 'in' limit)
            // This fixes the N+1 query problem
            if (parentClassIds.length > 0) {
                // Split into batches of 10 (Firestore 'in' limit)
                const batches = [];
                for (let i = 0; i < parentClassIds.length; i += 10) {
                    batches.push(parentClassIds.slice(i, i + 10));
                }

                await Promise.all(batches.map(async (batch) => {
                    const batchQuery = query(
                        collection(db, 'classes'),
                        where('__name__', 'in', batch)
                    );
                    const batchSnap = await getDocs(batchQuery);
                    batchSnap.docs.forEach(doc => {
                        const classData = { id: doc.id, ...doc.data(), role: 'parent' } as ClassWithRole;
                        classesMap.set(doc.id, classData);
                    });
                }));
            }

            let result = Array.from(classesMap.values());

            // SUPER ADMIN CHECK
            const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
            if (userEmail && adminEmails.map(e => e.trim()).includes(userEmail)) {
                result = result.map(c => ({ ...c, role: 'admin' }));
            }

            return result;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 1, // Reduced to 1 minute for faster updates
        refetchOnMount: 'always', // Always refetch on mount to avoid stale admin status
    });
}

export function useUserClass(userId: string | undefined, userEmail?: string | null) {
    // Legacy support: return the first class from the list
    const { data } = useUserClasses(userId, userEmail);
    // Priority: Admin class > First class found
    const activeClass = data?.find((c: ClassWithRole) => c.role === 'admin') || data?.[0] || null;
    return {
        data: activeClass,
        isLoading: !data,
    };
}


export function useSchool(schoolId: string | undefined | null) {
    return useQuery({
        queryKey: ['school', schoolId],
        queryFn: () => (schoolId ? getSchool(schoolId) : null),
        enabled: !!schoolId,
    });
}

// ========================================
// CLASS HOOKS
// ========================================

export function useClass(classId: string | null) {
    return useQuery({
        queryKey: ['class', classId],
        queryFn: () => (classId ? getClass(classId) : null),
        enabled: !!classId,
    });
}

// ========================================
// STUDENT HOOKS
// ========================================

export function useStudents(classId: string | null) {
    return useQuery({
        queryKey: ['students', classId],
        queryFn: () => (classId ? getStudentsByClass(classId) : []),
        enabled: !!classId,
    });
}

export function useCreateStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateStudentInput) => createStudent(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['students', variables.classId] });
        },
    });
}

export function useUpdateStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ studentId, data }: { studentId: string; data: Partial<CreateStudentInput> }) =>
            updateStudent(studentId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
}

export function useDeleteStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (studentId: string) => deleteStudent(studentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
}

// ========================================
// SCHOOL HOOKS
// ========================================

// ========================================
// PARENT LINK HOOKS
// ========================================

export function useParentLinks(studentId: string | null) {
    return useQuery({
        queryKey: ['parentLinks', studentId],
        queryFn: () => (studentId ? getParentLinksByStudent(studentId) : []),
        enabled: !!studentId,
    });
}

export function useUserParentLink(userId: string | undefined, classId: string | null) {
    return useQuery({
        queryKey: ['parentLink', userId, classId],
        queryFn: () => (userId && classId ? getParentLinkByUserAndClass(userId, classId) : null),
        enabled: !!userId && !!classId,
    });
}

export function useUserStudentIds(userId: string | undefined, classId: string | null) {
    return useQuery({
        queryKey: ['userStudentIds', userId, classId],
        queryFn: async () => {
            if (!userId || !classId) return [];
            // Get all links for user
            const links = await getParentLinksByUser(userId);
            // Filter by class and map to studentId
            return links
                .filter(link => link.classId === classId)
                .map(link => link.studentId);
        },
        enabled: !!userId && !!classId,
    });
}

// ========================================
// TASK HOOKS (Patrol & Events)
// ========================================

export function useTasks(classId: string | null, schoolId?: string | null, myStudentIds?: string[], currentUserId?: string) {
    return useQuery({
        queryKey: ['tasks', classId, schoolId, myStudentIds, currentUserId],
        queryFn: async () => {
            const classTasks = classId ? await getTasksByClass(classId) : [];
            const schoolTasks = schoolId ? await getTasksBySchool(schoolId) : [];

            // Merge
            let allTasks = [...classTasks, ...schoolTasks];

            // Filter Private Tasks
            if (currentUserId && myStudentIds) {
                allTasks = allTasks.filter(task => {
                    // Public tasks are visible to everyone in class/school
                    if (!task.isPrivate) return true;

                    // Creator always sees their own tasks
                    if (task.createdBy === currentUserId) return true;

                    // Invited?
                    // Check if any of my students are in the invitee list
                    if (task.invitees && task.invitees.some(id => myStudentIds.includes(id))) {
                        return true;
                    }

                    return false;
                });
            }

            // Sort
            return allTasks.sort((a, b) => {
                const aTime = a.date?.seconds || 0;
                const bTime = b.date?.seconds || 0;
                return bTime - aTime;
            });
        },
        enabled: !!classId || !!schoolId,
    });
}

export function useSchoolTasks(schoolId: string | undefined | null) {
    return useQuery({
        queryKey: ['schoolTasks', schoolId],
        queryFn: async () => {
            if (!schoolId) return [];
            return await getTasksBySchool(schoolId);
        },
        enabled: !!schoolId,
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTaskInput) => createTask(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Invalidate all tasks queries
        },
    });
}

export function useClaimTaskSlot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            taskId,
            userId,
            userName,
            studentId,
            studentName
        }: {
            taskId: string;
            userId: string;
            userName: string;
            studentId?: string;
            studentName?: string;
        }) => claimTaskSlot(taskId, userId, userName, studentId, studentName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useUnclaimTaskSlot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
            unclaimTaskSlot(taskId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, data }: { taskId: string; data: Partial<Task> }) =>
            updateTask(taskId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (taskId: string) => deleteTask(taskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

// ========================================
// ANNOUNCEMENT HOOKS
// ========================================

export function useAnnouncements(classId: string | null, schoolId?: string | null) {
    return useQuery({
        queryKey: ['announcements', classId, schoolId],
        queryFn: async () => {
            const classAnnouncements = classId ? await getAnnouncementsByClass(classId) : [];
            const schoolAnnouncements = schoolId ? await getAnnouncementsBySchool(schoolId) : [];

            // Merge and Sort: Pinned first, then by date
            const all = [...classAnnouncements, ...schoolAnnouncements];

            return all.sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
                const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
                return bTime - aTime;
            });
        },
        enabled: !!classId || !!schoolId,
    });
}

export function useCreateAnnouncement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAnnouncementInput) => createAnnouncement(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['announcements', variables.classId] });
        },
    });
}

export function useToggleAnnouncementPin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ announcementId, pinned }: { announcementId: string; pinned: boolean }) =>
            toggleAnnouncementPin(announcementId, pinned),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        },
    });
}

export function useUpdateAnnouncement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ announcementId, data }: { announcementId: string; data: Partial<Announcement> }) =>
            updateAnnouncement(announcementId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        },
    });
}

export function useDeleteAnnouncement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (announcementId: string) => deleteAnnouncement(announcementId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        },
    });
}
// ==========================================
// Lost & Found Hooks
// ==========================================

export const useLostItems = (schoolId: string, classId: string) => {
    return useQuery({
        queryKey: ['lostItems', schoolId, classId],
        queryFn: async () => {
            if (!schoolId && !classId) return [];

            // We want:
            // 1. All 'found' items for the SCHOOL (scope: 'school')
            // 2. All 'lost' items for the CLASS (scope: 'class')

            // Note: Firebase OR queries are limited. We might need two queries or one broad query.
            // Let's try fetching school-scoped items for now, and filter in UI if needed, 
            // OR fetch all items for the school if scope is school.

            // Strategy: Fetch all items where schoolId == schoolId.
            // Then filter in memory or valid security rules.
            // Assuming we just want to see everything for the school for now to be safe.

            const q = query(
                collection(db, 'lost_items'),
                where('schoolId', '==', schoolId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LostItem));
        },
        enabled: !!schoolId
    });
};

export const useCreateLostItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (item: Omit<LostItem, 'id'>) => {
            const docRef = await addDoc(collection(db, 'lost_items'), {
                ...item,
                createdAt: serverTimestamp()
            });
            return docRef.id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lostItems'] });
        }
    });
};

export const useUpdateLostItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<LostItem> }) => {
            const docRef = doc(db, 'lost_items', id);
            await updateDoc(docRef, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lostItems'] });
        }
    });
};

export const useDeleteLostItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await deleteDoc(doc(db, 'lost_items', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lostItems'] });
        }
    });
};

export const useVoteAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ announcementId, optionId, userId, toggle }: { announcementId: string; optionId: string; userId: string; toggle: boolean }) => {
            const docRef = doc(db, 'announcements', announcementId);
            const snapshot = await getDoc(docRef);
            if (!snapshot.exists()) throw new Error("Announcement not found");

            const data = snapshot.data() as Announcement;
            const options = data.pollOptions || [];

            const newOptions = options.map(opt => {
                let newVotes = opt.votes || [];

                // If single choice (and we are adding a vote), remove from others first
                if (!data.allowMultipleVotes && !toggle && opt.id !== optionId) {
                    newVotes = newVotes.filter(uid => uid !== userId);
                }

                if (opt.id === optionId) {
                    if (toggle) {
                        // Remove vote
                        return { ...opt, votes: newVotes.filter(uid => uid !== userId) };
                    } else {
                        // Add vote (if not already there)
                        if (!newVotes.includes(userId)) {
                            return { ...opt, votes: [...newVotes, userId] };
                        }
                    }
                }

                return { ...opt, votes: newVotes };
            });

            await updateDoc(docRef, { pollOptions: newOptions });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        }
    });
};
