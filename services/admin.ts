/**
 * Admin-specific Firestore services
 * Functions for user management, analytics, and admin operations
 */

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { logger } from '@/lib/logger';
import type { User, ParentLink, Class } from '@/types';
import { getParentLinksByUser, getClass } from './firestore';

// ========================================
// USER MANAGEMENT
// ========================================

/**
 * Get all users (admin only)
 */
export async function getAllUsers(limitCount = 100): Promise<User[]> {
    try {
        const q = query(
            collection(db, 'users'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
    } catch (error) {
        logger.error('Failed to get all users', error);
        return [];
    }
}

/**
 * Search users by email
 */
export async function searchUsers(searchQuery: string): Promise<User[]> {
    try {
        const normalizedQuery = searchQuery.toLowerCase();

        const emailQuery = query(
            collection(db, 'users'),
            where('email', '>=', normalizedQuery),
            where('email', '<=', normalizedQuery + '\uf8ff'),
            limit(20)
        );
        const emailSnapshot = await getDocs(emailQuery);
        return emailSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
    } catch (error) {
        logger.error('Failed to search users', error);
        return [];
    }
}

/**
 * Get all classes for a user (via parent links)
 */
export async function getUserClasses(userId: string): Promise<Class[]> {
    try {
        const links = await getParentLinksByUser(userId);
        if (links.length === 0) return [];

        const classIds = [...new Set(links.map(link => link.classId))];

        const classes: Class[] = [];
        for (const classId of classIds) {
            const classData = await getClass(classId);
            if (classData) classes.push(classData);
        }

        return classes;
    } catch (error) {
        logger.error('Failed to get user classes', error);
        return [];
    }
}

// ========================================
// ONBOARDING SUPPORT
// ========================================

/**
 * Get ALL pending parent links (admin only)
 */
export async function getAllPendingParentLinks(): Promise<ParentLink[]> {
    try {
        const q = query(
            collection(db, 'parentLinks'),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc'),
            limit(100)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ParentLink));
    } catch (error) {
        logger.error('Failed to get all pending parent links', error);
        return [];
    }
}

// ========================================
// ANALYTICS
// ========================================

export interface SystemStats {
    totalUsers: number;
    totalClasses: number;
    totalSchools: number;
    pendingApprovals: number;
}

/**
 * Get system-wide statistics
 */
export async function getSystemStats(): Promise<SystemStats> {
    try {
        const [usersSnap, classesSnap, schoolsSnap, pendingSnap] = await Promise.all([
            getDocs(collection(db, 'users')),
            getDocs(collection(db, 'classes')),
            getDocs(collection(db, 'schools')),
            getDocs(query(collection(db, 'parentLinks'), where('status', '==', 'pending')))
        ]);

        return {
            totalUsers: usersSnap.size,
            totalClasses: classesSnap.size,
            totalSchools: schoolsSnap.size,
            pendingApprovals: pendingSnap.size,
        };
    } catch (error) {
        logger.error('Failed to get system stats', error);
        return {
            totalUsers: 0,
            totalClasses: 0,
            totalSchools: 0,
            pendingApprovals: 0,
        };
    }
}

// ========================================
// DELETE OPERATIONS
// ========================================

/**
 * Delete a user (DANGEROUS - admin only)
 */
export async function deleteUser(userId: string): Promise<void> {
    try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase/config');

        await deleteDoc(doc(db, 'users', userId));
        logger.info(`Deleted user ${userId}`);
    } catch (error) {
        logger.error('Failed to delete user', error);
        throw new Error('Gat ekki eytt notanda');
    }
}

/**
 * Delete a school (DANGEROUS - admin only)
 */
export async function deleteSchool(schoolId: string): Promise<void> {
    try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase/config');

        await deleteDoc(doc(db, 'schools', schoolId));
        logger.info(`Deleted school ${schoolId}`);
    } catch (error) {
        logger.error('Failed to delete school', error);
        throw new Error('Gat ekki eytt skóla');
    }
}

/**
 * Delete a class (DANGEROUS - admin only)
 */
export async function deleteClass(classId: string): Promise<void> {
    try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase/config');

        await deleteDoc(doc(db, 'classes', classId));
        logger.info(`Deleted class ${classId}`);
    } catch (error) {
        logger.error('Failed to delete class', error);
        throw new Error('Gat ekki eytt bekk');
    }
}

