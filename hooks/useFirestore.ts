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
    claimTaskSlot,
    unclaimTaskSlot,
    deleteTask,
    getAnnouncementsByClass,
    createAnnouncement,
    toggleAnnouncementPin,
    deleteAnnouncement,
} from '@/services/firestore';
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

export function useDeleteAnnouncement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (announcementId: string) => deleteAnnouncement(announcementId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        },
    });
}
