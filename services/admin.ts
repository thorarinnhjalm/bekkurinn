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
    const stats = {
        totalUsers: 0,
        totalClasses: 0,
        totalSchools: 0,
        pendingApprovals: 0,
    };

    try {
        // Test Users
        try {
            const usersSnap = await getDocs(collection(db, 'users'));
            stats.totalUsers = usersSnap.size;
        } catch (e: any) {
            console.error('Stats Error (Users):', e.message);
        }

        // Test Classes
        try {
            const classesSnap = await getDocs(collection(db, 'classes'));
            stats.totalClasses = classesSnap.size;
        } catch (e: any) {
            console.error('Stats Error (Classes):', e.message);
        }

        // Test Schools
        try {
            const schoolsSnap = await getDocs(collection(db, 'schools'));
            stats.totalSchools = schoolsSnap.size;
        } catch (e: any) {
            console.error('Stats Error (Schools):', e.message);
        }

        // Test Pending
        try {
            const pendingSnap = await getDocs(query(collection(db, 'parentLinks'), where('status', '==', 'pending')));
            stats.pendingApprovals = pendingSnap.size;
        } catch (e: any) {
            console.error('Stats Error (Pending):', e.message);
        }

        console.log('Final Calculated Stats:', stats);
        return stats;

    } catch (error) {
        logger.error('Failed to get system stats (General)', error);
        return stats;
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

