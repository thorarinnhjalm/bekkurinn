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
} from '@/services/firestore';
import type { Task, Announcement } from '@/types';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// ... other hooks ...

// ========================================
// USER / CONTEXT HOOKS
// ========================================

export function useUserClasses(userId: string | undefined) {
    return useQuery({
        queryKey: ['userClasses', userId],
        queryFn: async () => {
            if (!userId) return [];

            const classesMap = new Map();

            // 1. Check if admin (PRIORITY - checked first)
            const adminQ = query(collection(db, 'classes'), where('admins', 'array-contains', userId));
            const adminSnap = await getDocs(adminQ);

            adminSnap.docs.forEach(doc => {
                const classData = { id: doc.id, ...doc.data(), role: 'admin' } as any;
                classesMap.set(doc.id, classData);
            });

            // 2. Check parentLinks (ONLY for classes where user is NOT admin)
            const parentQ = query(collection(db, 'parentLinks'), where('userId', '==', userId));
            const parentSnap = await getDocs(parentQ);

            // We need to fetch class details for each parent link
            // CRITICAL: Filter out classes where user is already admin
            const parentClassIds = parentSnap.docs
                .map(doc => doc.data().classId)
                .filter(id => {
                    const isAlreadyAdmin = classesMap.has(id);
                    return !isAlreadyAdmin;
                });

            // Fetch in parallel
            await Promise.all(parentClassIds.map(async (classId) => {
                const classDocRef = doc(db, 'classes', classId);
                const classSnap = await getDoc(classDocRef);
                if (classSnap.exists()) {
                    const classData = { id: classSnap.id, ...classSnap.data(), role: 'parent' } as any;
                    classesMap.set(classSnap.id, classData);
                }
            }));

            const result = Array.from(classesMap.values());
            return result;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 1, // Reduced to 1 minute for faster updates
        refetchOnMount: 'always', // Always refetch on mount to avoid stale admin status
    });
}

export function useUserClass(userId: string | undefined) {
    // Legacy support: return the first class from the list
    const { data } = useUserClasses(userId);
    return {
        data: data && data.length > 0 ? data[0] : null,
        isLoading: !data, // Approximated
    };
}
import type {
    CreateStudentInput,
    CreateTaskInput,
    CreateAnnouncementInput,
} from '@/types';

/**
 * React Query Hooks for Bekkurinn
 * 
 * Configured with aggressive caching (5min stale time)
 * to minimize Firestore reads
 */

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

// ========================================
// TASK HOOKS (Patrol & Events)
// ========================================

export function useTasks(classId: string | null) {
    return useQuery({
        queryKey: ['tasks', classId],
        queryFn: () => (classId ? getTasksByClass(classId) : []),
        enabled: !!classId,
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTaskInput) => createTask(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tasks', variables.classId] });
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
        }: {
            taskId: string;
            userId: string;
            userName: string;
        }) => claimTaskSlot(taskId, userId, userName),
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

export function useAnnouncements(classId: string | null) {
    return useQuery({
        queryKey: ['announcements', classId],
        queryFn: () => (classId ? getAnnouncementsByClass(classId) : []),
        enabled: !!classId,
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
